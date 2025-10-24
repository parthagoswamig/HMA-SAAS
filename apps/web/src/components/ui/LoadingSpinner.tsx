'use client';

import React from 'react';
import { Loader } from '@mantine/core';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingSpinner({
  fullScreen = false,
  message = 'Loading...',
  size = 'lg',
}: LoadingSpinnerProps) {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size === 'xl' ? '80px' : size === 'lg' ? '60px' : '40px',
          height: size === 'xl' ? '80px' : size === 'lg' ? '60px' : '40px',
        }}
      >
        <div className="pulse-ring" />
        <div className="pulse-ring" style={{ animationDelay: '0.2s' }} />
        <div className="pulse-ring" style={{ animationDelay: '0.4s' }} />
        <Loader
          size={size}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      {message && (
        <p
          style={{
            color: fullScreen ? 'white' : '#667eea',
            fontSize: '1rem',
            fontWeight: 500,
            margin: 0,
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          {message}
        </p>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-ring {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 3px solid ${fullScreen ? 'rgba(255,255,255,0.5)' : '#667eea'};
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        role="alert"
        aria-busy="true"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
