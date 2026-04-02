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
            backgroundColor: '#f0faf7',
            padding: '60px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Decorative background orbs to match frontend styling */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(11,143,117,0.15) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Header row (Logo / Watermark) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#0b8f75',
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
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#0d1f1a', letterSpacing: '-0.5px' }}>
                RemoteJobDesk
              </span>
            </div>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(11,143,117,0.1)",
                color: "#075f4e",
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
                 backgroundColor: '#e0f5f0',
                 color: '#075f4e',
                 padding: '8px 16px',
                 borderRadius: '9999px',
                 fontSize: '20px',
                 fontWeight: 'bold'
               }}>{country}</span>
               <span style={{
                 backgroundColor: '#1e293b',
                 color: 'white',
                 padding: '8px 16px',
                 borderRadius: '9999px',
                 fontSize: '20px',
                 fontWeight: 'bold'
               }}>{category.toUpperCase()}</span>
            </div>

            <h1
              style={{
                fontSize: title!.length > 60 ? '54px' : '64px', // shrink text if it's very long
                fontWeight: '900',
                color: '#0f172a',
                lineHeight: 1.1,
                margin: '10px 0 0 0',
                maxWidth: '900px',
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
                border: `3px solid ${brandColor}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '900',
              }}
            >
                {/* To simulate the avatar background with alpha without css transparency issues in satori, just make text colored */}
                <span style={{ color: brandColor }}>{initials}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#64748b' }}>
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
