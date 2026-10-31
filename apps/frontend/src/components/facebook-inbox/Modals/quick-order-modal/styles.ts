import React from "react";

export const overlayStyle: React.CSSProperties = {
  background: "rgba(7, 17, 32, 0.58)",
  backdropFilter: "blur(12px)",
};

export const headingStyle: React.CSSProperties = {
  color: "var(--color-foreground)",
};

export const mutedStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

export const primaryStyle: React.CSSProperties = {
  color: "var(--color-primary)",
};

export const successStyle: React.CSSProperties = {
  color: "color-mix(in srgb, var(--business-success) 74%, black)",
};

export const warningStyle: React.CSSProperties = {
  color: "color-mix(in srgb, var(--business-warning) 74%, black)",
};

export const dangerStyle: React.CSSProperties = {
  color: "color-mix(in srgb, var(--business-danger) 74%, black)",
};

export const sectionSurfaceStyle: React.CSSProperties = {
  background: "var(--business-surface-subtle)",
  border: "1px solid var(--business-card-border)",
  boxShadow: "0 24px 52px -42px rgba(7, 17, 32, 0.28)",
};

export const getVariantButtonStyle = (
  isActive: boolean,
  isAvailable: boolean,
): React.CSSProperties => {
  if (isActive) {
    return {
      background:
        "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
      borderColor: "transparent",
      color: "white",
    };
  }

  if (isAvailable) {
    return {
      background: "var(--business-surface-subtle)",
      borderColor: "var(--business-card-border)",
      color: "var(--color-foreground)",
    };
  }

  return {
    background:
      "color-mix(in srgb, var(--color-border) 18%, var(--color-background))",
    borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)",
    color: "var(--color-muted-foreground)",
  };
};
