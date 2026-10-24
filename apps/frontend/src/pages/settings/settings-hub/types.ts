import React from 'react';

export interface SettingsTab {
  id: string;
  name: string;
  component: React.ComponentType;
}

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
};

export interface SectionHeaderProps {
  title: string;
  description: string;
}
