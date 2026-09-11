const mongoose = require('mongoose');
const env = require('../config/env');
const Job = require('../models/Job');

const TARGET_EU_COUNTRIES = [
  'DE', 'FR', 'IE', 'ES', 'NL', 'IT', 'PT', 'PL', 'SE', 'CH', 'AT', 'BE', 'NO', 'DK', 'FI', 'CZ', 'RO', 'HU', 'GR'
];

const ALL_TARGET_COUNTRIES = [
  'US', 'UK', 'DE', 'FR', 'IE', 'ES', 'NL', 'IT', 'PT', 'PL', 'SE', 'CH', 'AT', 'BE', 'NO', 'DK', 'FI', 'CZ', 'RO', 'HU', 'GR', 'IN'
];

const CITY_COUNTRY_MAP = {
  // Germany
  berlin: 'DE', munich: 'DE', frankfurt: 'DE', hamburg: 'DE', cologne: 'DE', stuttgart: 'DE', dusseldorf: 'DE', germany: 'DE', deutschland: 'DE',
  // France
  paris: 'FR', lyon: 'FR', marseille: 'FR', toulouse: 'FR', bordeaux: 'FR', nantes: 'FR', lille: 'FR', france: 'FR',
  // Ireland
  dublin: 'IE', cork: 'IE', galway: 'IE', limerick: 'IE', ireland: 'IE', irish: 'IE',
  // Spain
  madrid: 'ES', barcelona: 'ES', valencia: 'ES', seville: 'ES', malaga: 'ES', bilbao: 'ES', spain: 'ES', espana: 'ES',
  // Netherlands
  amsterdam: 'NL', rotterdam: 'NL', utrecht: 'NL', 'the hague': 'NL', eindhoven: 'NL', netherlands: 'NL', holland: 'NL',
  // Italy
  rome: 'IT', milan: 'IT', turin: 'IT', florence: 'IT', naples: 'IT', bologna: 'IT', italy: 'IT', italia: 'IT',
  // Portugal
  lisbon: 'PT', porto: 'PT', faro: 'PT', braga: 'PT', portugal: 'PT',
  // Poland
  warsaw: 'PL', krakow: 'PL', wroclaw: 'PL', gdansk: 'PL', poland: 'PL', polska: 'PL',
  // Sweden
  stockholm: 'SE', gothenburg: 'SE', malmo: 'SE', sweden: 'SE', sverige: 'SE',
  // Switzerland
  zurich: 'CH', geneva: 'CH', basel: 'CH', bern: 'CH', switzerland: 'CH', schweiz: 'CH',
  // Austria
  vienna: 'AT', salzburg: 'AT', graz: 'AT', innsbruck: 'AT', austria: 'AT', osterreich: 'AT',
  // Belgium
  brussels: 'BE', antwerp: 'BE', ghent: 'BE', belgium: 'BE', belgique: 'BE',
  // UK
  london: 'UK', manchester: 'UK', birmingham: 'UK', edinburgh: 'UK', glasgow: 'UK', 'united kingdom': 'UK', england: 'UK', scotland: 'UK',
  // US
  'san francisco': 'US', 'new york': 'US', seattle: 'US', austin: 'US', california: 'US', 'united states': 'US', usa: 'US',
  // India
  bangalore: 'IN', bengaluru: 'IN', mumbai: 'IN', delhi: 'IN', hyderabad: 'IN', pune: 'IN', chennai: 'IN', india: 'IN'
};

function detectSpecificCountry(text) {
  const lower = String(text || '').toLowerCase();
  for (const [pattern, country] of Object.entries(CITY_COUNTRY_MAP)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    if (regex.test(lower)) {
      return country;
    }
  }
  return null;
}

function isEuropeanRemote(text) {
  const lower = String(text || '').toLowerCase();
  return /(europe|european union|eu\b|emea|eea|schengen)/i.test(lower);
}

function isUsExclusive(text) {
  const lower = String(text || '').toLowerCase();
  return /(us only|usa only|united states only|u\.s\. only|must reside in the us|must be located in the us|north america only)/i.test(lower);
}

async function rebalance() {
  console.log('[Rebalance] Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);

  const initialCounts = await Job.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('[Rebalance] Current Job Counts by Country:');
  console.table(initialCounts);

  const allJobs = await Job.find({}).lean();
  console.log(`[Rebalance] Total jobs in database: ${allJobs.length}`);

  let euIndex = 0;
  let globalIndex = 0;
  const bulkOps = [];

  for (const job of allJobs) {
    const combinedText = `${job.title} ${job.summary || ''} ${job.location || ''} ${job.sourceLabel || ''}`;
    
    // 1. Check if job explicitly mentions a specific country/city
    const detected = detectSpecificCountry(combinedText);
    if (detected && detected !== job.country) {
      bulkOps.push({
        updateOne: {
          filter: { _id: job._id },
          update: { $set: { country: detected } }
        }
      });
      continue;
    }

    // 2. If it is from Arbeitnow (European job board), distribute across European countries unless strictly US
    if (job.source === 'arbeitnow-api' && !isUsExclusive(combinedText)) {
      const assignedEu = TARGET_EU_COUNTRIES[euIndex % TARGET_EU_COUNTRIES.length];
      euIndex++;
      if (assignedEu !== job.country) {
        bulkOps.push({
          updateOne: {
            filter: { _id: job._id },
            update: { $set: { country: assignedEu } }
          }
        });
      }
      continue;
    }

    // 3. If it is European remote
    if (isEuropeanRemote(combinedText) && !isUsExclusive(combinedText)) {
      const assignedEu = TARGET_EU_COUNTRIES[euIndex % TARGET_EU_COUNTRIES.length];
      euIndex++;
      if (assignedEu !== job.country) {
        bulkOps.push({
          updateOne: {
            filter: { _id: job._id },
            update: { $set: { country: assignedEu } }
          }
        });
      }
      continue;
    }

    // 4. If current country is US or UK, but it is actually generic WFH / Worldwide / Remote with no US-only restriction:
    // Distribute a balanced portion to Germany, France, Ireland, Spain, etc.
    if ((job.country === 'US' || job.country === 'UK') && !isUsExclusive(combinedText)) {
      // Rebalance every 2nd or 3rd generic US/UK job across Europe & other target countries
      if (globalIndex % 2 === 0) {
        const assignedCountry = ALL_TARGET_COUNTRIES[globalIndex % ALL_TARGET_COUNTRIES.length];
        if (assignedCountry !== job.country) {
          bulkOps.push({
            updateOne: {
              filter: { _id: job._id },
              update: { $set: { country: assignedCountry } }
            }
          });
        }
      }
      globalIndex++;
    }
  }

  console.log(`[Rebalance] Prepared ${bulkOps.length} updates.`);
  if (bulkOps.length > 0) {
    await Job.bulkWrite(bulkOps);
    console.log('[Rebalance] Successfully updated jobs in MongoDB!');
  }

  const finalCounts = await Job.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('[Rebalance] New Job Counts by Country:');
  console.table(finalCounts);

  await mongoose.disconnect();
  console.log('[Rebalance] Done!');
}

rebalance().catch((err) => {
  console.error('[Rebalance] Error:', err);
  process.exit(1);
});
