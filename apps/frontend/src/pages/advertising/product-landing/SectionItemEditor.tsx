import React from "react";
import { LandingSection } from "./types";
import {
  SectionItemEditorProps,
  MediaUploadControls,
  TextSectionEditor,
  HeadingSectionEditor,
  HtmlSectionEditor,
  BannersSectionEditor,
  MediaSectionEditor,
  GallerySectionEditor,
  ImageOnlySectionEditor,
  CarouselSectionEditor,
  YoutubeVideoSectionEditor,
  VideoReelSectionEditor,
  CountdownSectionEditor,
  FeaturesSectionEditor,
  HowItWorksSectionEditor,
  BuyButtonSectionEditor,
  ReviewsSectionEditor,
  FaqSectionEditor,
  LiveProofSectionEditor,
  BeforeAfterSectionEditor,
  ComparisonSectionEditor,
  BreakdownSectionEditor,
  FormSectionEditor,
  FeaturedProductSectionEditor,
} from "./section-item-editor";

// Re-export MediaUploadControls for full backward-compatibility
export { MediaUploadControls };
export type { SectionItemEditorProps };

export const SectionItemEditor: React.FC<SectionItemEditorProps> = ({
  section,
  onUpdateContent,
  product,
}) => {
  const { content, type } = section;

  const update = (partial: Partial<LandingSection["content"]>) => {
    onUpdateContent({ ...content, ...partial });
  };

  switch (type) {
    case "MEDIA":
      return <MediaSectionEditor content={content} update={update} product={product} />;
    case "TEXT":
      return <TextSectionEditor content={content} update={update} />;
    case "COUNTDOWN":
      return <CountdownSectionEditor content={content} update={update} />;
    case "FEATURES":
      return <FeaturesSectionEditor content={content} update={update} />;
    case "FORM":
      return <FormSectionEditor content={content} update={update} />;
    case "REVIEWS":
      return <ReviewsSectionEditor content={content} update={update} />;
    case "FAQ":
      return <FaqSectionEditor content={content} update={update} />;
    case "BANNERS":
      return <BannersSectionEditor content={content} update={update} />;
    case "HTML":
      return <HtmlSectionEditor content={content} update={update} />;
    case "COMPARISON":
      return <ComparisonSectionEditor content={content} update={update} />;
    case "BREAKDOWN":
      return <BreakdownSectionEditor content={content} update={update} />;
    case "GALLERY":
      return <GallerySectionEditor content={content} update={update} />;
    case "LIVE_PROOF":
      return <LiveProofSectionEditor content={content} update={update} />;
    case "VIDEO_REEL":
      return <VideoReelSectionEditor content={content} update={update} />;
    case "BEFORE_AFTER":
      return <BeforeAfterSectionEditor content={content} update={update} />;
    case "IMAGE_ONLY":
      return <ImageOnlySectionEditor content={content} update={update} />;
    case "CAROUSEL":
      return <CarouselSectionEditor content={content} update={update} />;
    case "HOW_IT_WORKS":
      return <HowItWorksSectionEditor content={content} update={update} />;
    case "FEATURED_PRODUCT":
      return <FeaturedProductSectionEditor content={content} update={update} product={product} />;
    case "YOUTUBE_VIDEO":
      return <YoutubeVideoSectionEditor content={content} update={update} />;
    case "BUY_BUTTON":
      return <BuyButtonSectionEditor content={content} update={update} />;
    case "HEADING":
      return <HeadingSectionEditor content={content} update={update} />;
    default:
      return null;
  }
};
