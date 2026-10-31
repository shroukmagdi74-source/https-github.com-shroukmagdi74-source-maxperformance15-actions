import React from 'react';

export const StorefrontErrorState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 text-center">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Error Loading Storefront</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        We couldn't load the storefront settings. Please try refreshing or
        contact support.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
};

export default StorefrontErrorState;
