import React from 'react';

export const IntruderNftBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-background mix-blend-multiply" />
    <svg
      className="absolute w-full h-full opacity-60 mix-blend-lighten"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="neonGradient1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor="hsl(var(--primary))"
            stopOpacity="0.4"
          />
          <stop offset="50%" stopColor="transparent" />
          <stop
            offset="100%"
            stopColor="hsl(var(--secondary))"
            stopOpacity="0.4"
          />
        </linearGradient>
      </defs>
      <path
        d="M-100,200 Q400,0 800,400 T1920,200"
        fill="none"
        stroke="url(#neonGradient1)"
        strokeWidth="80"
        filter="blur(60px)"
      />
      <path
        d="M-100,600 Q500,800 1000,500 T1920,800"
        fill="none"
        stroke="url(#neonGradient1)"
        strokeWidth="60"
        filter="blur(40px)"
      />
    </svg>
  </div>
);

export default IntruderNftBackground;
