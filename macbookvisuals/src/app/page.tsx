"use client";

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #000000 0%, #000000 100%)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        padding: '48px',
        background: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <h1 style={{
          fontSize: '48px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
           Macbook Visuals
        </h1>
        
        <h2 style={{
          fontSize: '24px',
          color: '#fff',
          marginBottom: '24px'
        }}>
          Video Publisher
        </h2>

        <p style={{
          color: '#888',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Automatically publish your music videos to TikTok and YouTube.
          Schedule up to 12 videos per day with auto-generated captions.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '14px 32px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
          >
            Get Started
          </button>

          <button
            onClick={() => router.push('/about')}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            Learn More
          </button>
        </div>

        <div style={{
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '1px solid #333'
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
             Auto-generate captions from filename
          </p>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
             Schedule 12 videos daily (11 AM - 10 PM)
          </p>
          <p style={{
            color: '#666',
            fontSize: '14px'
          }}>
            Publish to TikTok & YouTube simultaneously
          </p>
        </div>
      </div>
    </main>
  );
}