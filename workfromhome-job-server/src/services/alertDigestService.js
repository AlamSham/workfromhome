const Job = require('../models/Job');
const SavedSearchAlert = require('../models/SavedSearchAlert');
const env = require('../config/env');
const { sendEmail, isEmailDeliveryConfigured } = require('./emailService');
const { buildJobQueryFilter } = require('../utils/jobQueryFilters');
const { buildAbsoluteJobUrl } = require('../utils/jobUrl');

function getFrequencyWindowMs(frequency = 'daily') {
  return frequency === 'weekly'
    ? 7 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;
}

function isAlertDue(alert, now = new Date()) {
  if (!alert?.isActive) {
    return false;
  }

  if (!alert.lastDigestAt) {
    return true;
  }

  const elapsedMs = now.getTime() - new Date(alert.lastDigestAt).getTime();
  return elapsedMs >= getFrequencyWindowMs(alert.frequency);
}

function getDigestSince(alert, now = new Date()) {
  if (alert?.lastDigestAt) {
    return new Date(alert.lastDigestAt);
  }

  if (alert?.createdAt) {
    return new Date(alert.createdAt);
  }

  return new Date(now.getTime() - getFrequencyWindowMs(alert?.frequency));
}

function formatDate(value) {
  if (!value) {
    return 'Recently';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAlertQueryUrl(alert) {
  const siteUrl = String(env.siteUrl || '').replace(/\/+$/, '');
  const basePath = String(alert?.basePath || '/').startsWith('/')
    ? String(alert.basePath || '/')
    : `/${String(alert.basePath || '')}`;
  const params = new URLSearchParams();

  if (alert?.search) {
    params.set('search', alert.search);
  }

  if (alert?.seniority) {
    params.set('seniority', alert.seniority);
  }

  if (alert?.experience) {
    params.set('experience', alert.experience);
  }

  if (alert?.minSalary) {
    params.set('minSalary', String(alert.minSalary));
  }

  const query = params.toString();
  return `${siteUrl}${basePath}${query ? `?${query}` : ''}`;
}

function buildFilterSummary(alert) {
  const parts = [];

  if (alert?.search) {
    parts.push(`keyword: ${alert.search}`);
  }

  if (alert?.country) {
    parts.push(`country: ${alert.country}`);
  }

  if (alert?.company) {
    parts.push(`company: ${alert.company}`);
  }

  if (alert?.seniority) {
    parts.push(`level: ${alert.seniority}`);
  }

  if (alert?.experience) {
    parts.push(`experience: ${alert.experience}`);
  }

  if (alert?.minSalary) {
    parts.push(`salary: $${Number(alert.minSalary).toLocaleString()}+`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'all remote jobs';
}

function buildDigestSubject(alert, jobCount) {
  const frequencyLabel = alert?.frequency === 'weekly' ? 'Weekly' : 'Daily';
  const label = alert?.label || buildFilterSummary(alert);
  return `${frequencyLabel} remote jobs alert: ${label} (${jobCount} new)`;
}

function buildDigestHtml(alert, jobs, since) {
  const browseUrl = buildAlertQueryUrl(alert);
  const filterSummary = buildFilterSummary(alert);

  const jobItems = jobs
    .map((job) => {
      const title = job?.seo?.metaTitle || job.originalTitle || 'Remote job';
      const url = buildAbsoluteJobUrl(job, env.siteUrl);
      const company = job.sourceLabel || 'Remote Company';
      const meta = [
        job.country || 'Global',
        job.category ? String(job.category).toUpperCase() : 'WFH',
        job.signals?.salaryText || '',
        job.signals?.experienceText || ''
      ].filter(Boolean).join(' · ');
      const summary = escapeHtml(String(job.summary || '').slice(0, 180));

      return `
        <tr>
          <td style="padding:0 0 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dbe7e2;border-radius:16px;background:#ffffff;">
              <tr>
                <td style="padding:18px 18px 14px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0b8f75;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(company)}</p>
                  <h3 style="margin:0 0 8px;font-size:18px;line-height:1.4;color:#0f172a;">
                    <a href="${url}" style="color:#0f172a;text-decoration:none;">${escapeHtml(title)}</a>
                  </h3>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#64748b;">${escapeHtml(meta)}</p>
                  <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#475569;">${summary}</p>
                  <a href="${url}" style="display:inline-block;border-radius:12px;background:#0b8f75;padding:10px 16px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;">View job</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="margin:0;padding:24px;background:#f0faf7;font-family:Arial,sans-serif;color:#0d1f1a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;">
        <tr>
          <td style="padding:0 0 20px;">
            <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#075f4e;">Fresh remote jobs for your saved alert</h1>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#475569;">We found <strong>${jobs.length}</strong> new remote jobs matching <strong>${escapeHtml(filterSummary)}</strong> since ${formatDate(since)}.</p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">Open your saved search anytime: <a href="${browseUrl}" style="color:#0b8f75;">${browseUrl}</a></p>
          </td>
        </tr>
        ${jobItems}
        <tr>
          <td style="padding:8px 0 0;text-align:center;">
            <a href="${browseUrl}" style="display:inline-block;border-radius:14px;background:#0f172a;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Browse all matching jobs</a>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildDigestText(alert, jobs, since) {
  const browseUrl = buildAlertQueryUrl(alert);
  const lines = [
    'Fresh remote jobs for your saved alert',
    '',
    `We found ${jobs.length} new jobs matching ${buildFilterSummary(alert)} since ${formatDate(since)}.`,
    `Saved search: ${browseUrl}`,
    ''
  ];

  for (const job of jobs) {
    lines.push(`- ${job?.seo?.metaTitle || job.originalTitle || 'Remote job'}`);
    lines.push(`  ${job.sourceLabel || 'Remote Company'} | ${job.country || 'Global'} | ${formatDate(job.publishedAt)}`);
    if (job.signals?.salaryText) {
      lines.push(`  Salary: ${job.signals.salaryText}`);
    }
    if (job.signals?.experienceText) {
      lines.push(`  Experience: ${job.signals.experienceText}`);
    }
    lines.push(`  ${buildAbsoluteJobUrl(job, env.siteUrl)}`);
    lines.push('');
  }

  return lines.join('\n');
}

async function fetchAlertJobs(alert, since) {
  const { filter } = buildJobQueryFilter({
    search: alert.search,
    country: alert.country,
    company: alert.company,
    seniority: alert.seniority,
    experience: alert.experience,
    minSalary: alert.minSalary,
    publishedSince: since,
    maxSearchChars: env.maxSearchChars
  });

  return Job.find(filter)
    .select('_id sourceLabel country category originalTitle summary publishedAt seo.metaTitle seo.slug signals.salaryText signals.experienceText signals.seniority')
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(env.alertDigestJobLimit)
    .lean();
}

async function runAlertDigests(reason = 'cron') {
  const summary = {
    reason,
    scanned: 0,
    due: 0,
    sent: 0,
    noMatches: 0,
    failed: 0,
    skipped: 0
  };

  if (!env.alertDigestEnabled) {
    summary.skipped += 1;
    summary.message = 'Alert digest scheduler is disabled.';
    return summary;
  }

  if (!isEmailDeliveryConfigured()) {
    summary.skipped += 1;
    summary.message = 'Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.';
    return summary;
  }

  const now = new Date();
  const alerts = await SavedSearchAlert.find({ isActive: true })
    .sort({ lastDigestAt: 1, createdAt: 1 })
    .limit(env.alertDigestBatchSize)
    .lean();

  summary.scanned = alerts.length;

  for (const alert of alerts) {
    if (!isAlertDue(alert, now)) {
      continue;
    }

    summary.due += 1;
    const since = getDigestSince(alert, now);

    try {
      const jobs = await fetchAlertJobs(alert, since);

      if (!jobs.length) {
        await SavedSearchAlert.findByIdAndUpdate(alert._id, {
          $set: {
            lastDigestAt: now,
            lastError: ''
          }
        });
        summary.noMatches += 1;
        continue;
      }

      await sendEmail({
        to: alert.email,
        subject: buildDigestSubject(alert, jobs.length),
        html: buildDigestHtml(alert, jobs, since),
        text: buildDigestText(alert, jobs, since)
      });

      await SavedSearchAlert.findByIdAndUpdate(alert._id, {
        $set: {
          lastDigestAt: now,
          lastSentAt: now,
          lastError: ''
        },
        $inc: {
          sendCount: 1
        }
      });

      summary.sent += 1;
    } catch (error) {
      await SavedSearchAlert.findByIdAndUpdate(alert._id, {
        $set: {
          lastError: error?.message || 'Unknown digest error'
        }
      });
      summary.failed += 1;
    }
  }

  return summary;
}

module.exports = {
  runAlertDigests
};
