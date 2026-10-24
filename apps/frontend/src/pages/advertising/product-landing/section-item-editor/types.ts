import { LandingSection, ProductLandingProduct } from "../types";

export interface SectionItemEditorProps {
  section: LandingSection;
  onUpdateContent: (updatedContent: LandingSection["content"]) => void;
  product?: ProductLandingProduct | null;
}

export interface SingleSectionEditorProps {
  content: LandingSection["content"];
  update: (partial: Partial<LandingSection["content"]>) => void;
  product?: ProductLandingProduct | null;
}

export interface CommonStylingProps {
  content: LandingSection["content"];
  update: (partial: Partial<LandingSection["content"]>) => void;
}
