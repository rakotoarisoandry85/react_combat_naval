// src/components/SplashScreen.tsx
import React from 'react';

const splashImg = new URL('../assets/splash1.png', import.meta.url).href;


export default function SplashScreen({ onStart }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #0a1a2a 0%, #0d2b45 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
    >
      {/* Image principale */}
      <img
        src={splashImg}
        alt="Naval Combat"
        style={{
          maxWidth: 'min(92vw, 900px)',
          maxHeight: '70vh',
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          objectFit: 'contain',
          border: '2px solid rgba(255,255,255,0.08)',
        }}
      />

      {/* Bouton Jouer */}
      <button
        onClick={onStart}
        style={{
          marginTop: 32,
          padding: '16px 56px',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1.5,
          background: 'linear-gradient(135deg, #1e6fa8 0%, #0d4a7a 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          boxShadow: '0 10px 28px rgba(30, 111, 168, 0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 14px 36px rgba(30, 111, 168, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(30, 111, 168, 0.45)';
        }}
      >
        JOUER
      </button>

      {/* Petit texte en bas */}
      <p
        style={{
          marginTop: 18,
          color: 'rgba(255,255,255,0.45)',
          fontSize: 13,
          letterSpacing: 0.5,
        }}
      >
        Cliquez pour commencer la bataille
      </p>
    </div>
  );
}