import React from 'react';
import ReviewMediaGallery from '../../components/ReviewMediaGallery';

interface ReviewMediaItem {
  url: string;
  type: string;
  poster?: string;
  alt?: string;
}

interface ReviewsMediaFeedProps {
  shouldShowLoading: boolean;
  ugcEnabled: boolean;
  showMediaFeed: boolean;
  mediaFeed: ReviewMediaItem[];
  isElessiStoryGrid: boolean;
  isZenOrganic: boolean;
  isContentCentered: boolean;
  mediaTitle: string;
  mediaDescription: string;
  galleryStyle: string;
}

export const ReviewsMediaFeed: React.FC<ReviewsMediaFeedProps> = ({
  shouldShowLoading,
  ugcEnabled,
  showMediaFeed,
  mediaFeed,
  isElessiStoryGrid,
  isZenOrganic,
  isContentCentered,
  mediaTitle,
  mediaDescription,
  galleryStyle,
}) => {
  if (
    shouldShowLoading ||
    !ugcEnabled ||
    !showMediaFeed ||
    mediaFeed.length === 0 ||
    isElessiStoryGrid
  ) {
    return null;
  }

  return (
    <div
      className={`mb-10 space-y-3 ${
        isZenOrganic ? 'border-b border-[#e9ebe5] pb-10' : ''
      }`}
    >
      <div className={isContentCentered ? 'text-center' : ''}>
        <h3
          className={`text-lg font-bold ${
            isZenOrganic ? 'text-[#1a3328]' : 'text-foreground'
          }`}
        >
          {mediaTitle}
        </h3>
        <p
          className={`text-sm ${
            isZenOrganic ? 'text-[#1a3328]/50' : 'text-muted-foreground'
          }`}
        >
          {mediaDescription}
        </p>
      </div>
      <ReviewMediaGallery media={mediaFeed as any} galleryStyle={galleryStyle} />
    </div>
  );
};

export default ReviewsMediaFeed;
