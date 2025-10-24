'use client';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 10000,
        padding: '1rem',
        background: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        transition: 'left 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '10px';
        e.currentTarget.style.top = '10px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      Skip to main content
    </a>
  );
}
