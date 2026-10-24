import React from 'react';

export interface ClarityValidationErrors {
  projectId?: string;
  apiToken?: string;
}

export interface ClarityFeature {
  icon: React.ReactNode;
  titleKey: string;
  title: string;
  subtitle: string;
  descKey: string;
  desc: string;
  color: string;
}

export interface ClaritySetupStep {
  step: string;
  titleKey: string;
  title: string;
  descKey: string;
  desc: string;
  link: string | null;
  linkTextKey: string | null;
  linkText: string | null;
  color: string;
}

export interface ClarityUsefulLink {
  labelKey: string;
  label: string;
  url: string;
}
