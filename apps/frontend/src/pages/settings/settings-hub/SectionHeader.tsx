import React from 'react';
import type { SectionHeaderProps } from './types';

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => (
  <div className="border-b border-border pb-4 mb-6">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  </div>
);
