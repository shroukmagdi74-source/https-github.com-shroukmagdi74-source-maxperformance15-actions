import React from "react";

export interface SavedText {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  isPinned?: boolean;
  createdAt: Date | string;
}

export interface TextGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectText: (text: { content: string; imageUrls?: string[] }) => void;
  onInsertText?: (content: string) => void;
}

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
  color: "var(--business-success)",
};

export const warningStyle: React.CSSProperties = {
  color: "var(--business-warning)",
};

export const dangerStyle: React.CSSProperties = {
  color: "var(--business-danger)",
};

export const selectedToneStyle: React.CSSProperties = {
  background: "color-mix(in srgb, var(--color-primary) 12%, var(--color-background))",
  borderColor: "color-mix(in srgb, var(--color-primary) 35%, transparent)",
  color: "var(--color-primary)",
};
