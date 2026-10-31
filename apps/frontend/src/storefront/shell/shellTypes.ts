import React from 'react';
import type { StorefrontTheme } from '../types/theme.types';
import type { StorefrontThemeInput } from '../engine/runtimeThemeResolver';

export interface StorefrontShellProps {
  subdomain?: string;
}

export interface StorefrontLayoutProps {
  previewThemeId?: string | null;
  activePageKey?: string;
}

export interface BreadcrumbTrailOptions {
  crumbColor?: string;
  activeColor?: string;
  slashColor?: string;
  justify?: 'center' | 'start';
  textSize?: string;
}
