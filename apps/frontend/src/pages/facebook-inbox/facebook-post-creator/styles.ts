import React from "react";

export const headingStyle: React.CSSProperties = {
  color: "var(--color-foreground)",
};

export const mutedStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

export const panelStyle: React.CSSProperties = {
  border: "1px solid var(--business-card-border)",
};

export const selectedSurfaceStyle: React.CSSProperties = {
  borderColor: "color-mix(in srgb, var(--color-primary) 28%, transparent)",
  background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
  boxShadow:
    "0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent)",
};

export const idleSurfaceStyle: React.CSSProperties = {
  borderColor: "var(--business-card-border)",
  background:
    "color-mix(in srgb, var(--color-background) 88%, var(--shell-control-bg) 12%)",
};

export const activeTabStyle: React.CSSProperties = {
  color: "var(--color-primary)",
  borderColor: "var(--color-primary)",
};

export const accentTabStyle: React.CSSProperties = {
  color: "var(--color-secondary)",
  borderColor: "var(--color-secondary)",
};

export const inactiveTabStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
  borderColor: "transparent",
};

export const pillActiveStyle: React.CSSProperties = {
  color: "var(--color-foreground)",
  background:
    "color-mix(in srgb, var(--color-background) 80%, var(--shell-control-bg) 20%)",
};

export const pillIdleStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

export const controlInputStyle: React.CSSProperties = {
  borderColor: "var(--business-card-border)",
  background:
    "color-mix(in srgb, var(--color-background) 90%, var(--shell-control-bg) 10%)",
  color: "var(--color-foreground)",
};

export const dropzoneStyle: React.CSSProperties = {
  borderColor: "var(--business-card-border)",
  background:
    "color-mix(in srgb, var(--color-background) 84%, var(--shell-control-bg) 16%)",
};

export const primaryActionStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
  color: "color-mix(in srgb, var(--color-background) 96%, transparent)",
};

export const disabledActionStyle: React.CSSProperties = {
  background:
    "color-mix(in srgb, var(--color-muted-foreground) 24%, var(--shell-control-bg))",
  color: "color-mix(in srgb, var(--color-background) 82%, transparent)",
};

export const successBannerStyle: React.CSSProperties = {
  background:
    "color-mix(in srgb, var(--business-success) 10%, var(--color-background))",
  borderColor: "color-mix(in srgb, var(--business-success) 18%, transparent)",
};

export const errorBannerStyle: React.CSSProperties = {
  background:
    "color-mix(in srgb, var(--business-danger) 10%, var(--color-background))",
  borderColor: "color-mix(in srgb, var(--business-danger) 18%, transparent)",
};
