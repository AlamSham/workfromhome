import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function getColor(s: string): string {
  const colors = ["#0b8f75","#7c3aed","#dc2626","#d97706","#059669","#2563eb","#db2777","#0891b2"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
  return colors[h];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const hasTitle = searchParams.has('title');
    const title = hasTitle ? searchParams.get('title') : 'Remote Work-From-Home Job';
    const company = searchParams.get('company') || 'Remote Company';
    const country = searchParams.get('country') || 'Global';
    const category = searchParams.get('category') || 'WFH';
    const brandColor = getColor(company);
    const initials = company.replace(/^https?:\/\/(www\.)?/, "").split(/[.\-\s]/)[0].slice(0, 2).toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#060a14',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)',
            padding: '60px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Header row (Logo / Watermark) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '24px',
                }}
              >
                R
              </div>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                Remote<span style={{ color: '#06b6d4' }}>Job</span>Desk
              </span>
            </div>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(6,182,212,0.15)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "#22d3ee",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Hiring Now
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <span style={{
                 backgroundColor: 'rgba(6,182,212,0.1)',
                 border: '1px solid rgba(6,182,212,0.2)',
                 color: '#22d3ee',
                 padding: '8px 18px',
                 borderRadius: '9999px',
                 fontSize: '18px',
                 fontWeight: 'bold'
               }}>{country}</span>
               <span style={{
                 backgroundColor: 'rgba(148,163,184,0.1)',
                 border: '1px solid rgba(148,163,184,0.2)',
                 color: '#f1f5f9',
                 padding: '8px 18px',
                 borderRadius: '9999px',
                 fontSize: '18px',
                 fontWeight: 'bold'
               }}>{category.toUpperCase()}</span>
            </div>

            <h1
              style={{
                fontSize: title!.length > 60 ? '54px' : '64px',
                fontWeight: '900',
                color: '#ffffff',
                lineHeight: 1.15,
                margin: '10px 0 0 0',
                maxWidth: '960px',
                letterSpacing: '-1px',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Footer row (Company Info) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10 }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: `2px solid ${brandColor}`,
                backgroundColor: 'rgba(15,23,42,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '900',
              }}
            >
                <span style={{ color: brandColor }}>{initials}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#94a3b8' }}>
              {company}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate an image`, {
      status: 500,
    });
  }
}
