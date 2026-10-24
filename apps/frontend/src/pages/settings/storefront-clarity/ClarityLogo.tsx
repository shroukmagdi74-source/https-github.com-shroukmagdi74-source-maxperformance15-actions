import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export const ClarityLogo: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="h-8 w-8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="64" height="64" rx="12" fill="#0078D4" />
    <path d="M20 44 C20 32 32 20 44 20" stroke="white" strokeWidth="5" strokeLinecap="round" />
    <path
      d="M20 44 C20 44 28 36 36 28"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.6"
    />
    <circle cx="44" cy="20" r="4" fill="white" />
  </svg>
);

export const ExternalLinkIcon: React.FC = () => (
  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
);
