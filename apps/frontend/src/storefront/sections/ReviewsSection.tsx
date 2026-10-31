import React from 'react';
import { STOREFRONT_REVIEWS_SECTION_ID } from '../utils/pdpCheckout';
import WriteReviewDialog from '../components/WriteReviewDialog';
import {
  ReviewsList,
  ReviewsMediaFeed,
  ReviewsRatingSummary,
  useReviewsSectionController,
  ZenOrganicTabs,
  type ReviewsSectionProps,
} from './reviews-section';

export type { ReviewsSectionProps };

export const ReviewsSection: React.FC<ReviewsSectionProps> = (props) => {
  const ctrl = useReviewsSectionController(props);

  return (
    <section
      id={STOREFRONT_REVIEWS_SECTION_ID}
      ref={ctrl.sectionRef as React.RefObject<HTMLElement>}
      className={`w-full border-t ${
        ctrl.isElessiStoryGrid && !ctrl.shouldUseCompactEmptyReviews ? 'min-h-[38rem]' : ''
      } ${ctrl.shouldUseCompactEmptyReviews ? 'py-6 md:py-12' : 'py-12 md:py-16'} ${
        ctrl.isElessiPlantReviews
          ? 'border-[#d8e6d8] bg-[linear-gradient(180deg,#fbfaf5_0%,#eef5ea_42%,#ffffff_100%)]'
        : ctrl.isElessiStoryGrid
          ? 'border-[#ead8ca] bg-[#fffdfa]'
        : ctrl.isElessiProofWall || ctrl.isElessiStoryGrid || ctrl.isElessiTrustPile
          ? 'border-[#ead8ca] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7f1_42%,#ffffff_100%)]'
        : ctrl.isScentNotesVariant
          ? 'border-[#eadfd7] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f4_42%,#ffffff_100%)]'
          : ctrl.isVoiceNotesVariant
            ? 'border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff9f8_42%,#ffffff_100%)]'
          : ctrl.isCommandProofVariant
            ? 'border-[#dce4ef] bg-[linear-gradient(180deg,#fffdf7_0%,#f8fafc_42%,#ffffff_100%)]'
          : 'border-border bg-background'
      }`}
    >
      <div className="container px-4 md:px-6">
        <ZenOrganicTabs
          isZenOrganic={ctrl.isZenOrganic}
          activeTab={ctrl.activeTab}
          setActiveTab={ctrl.setActiveTab}
          prefersArabicCopy={ctrl.prefersArabicCopy}
          productDescription={ctrl.product?.description}
          categoryName={ctrl.product?.category?.name}
          tagsValue={ctrl.tagsValue}
          notAvailableText={ctrl.notAvailableText}
        />

        <div className={ctrl.isZenOrganic && ctrl.activeTab !== 'reviews' ? 'hidden' : ''}>
          <ReviewsRatingSummary
            isZenOrganic={ctrl.isZenOrganic}
            shouldShowLoading={ctrl.shouldShowLoading}
            totalCount={ctrl.totalCount}
            averageRating={ctrl.averageRating}
            outOfText={ctrl.outOfText}
            reviewsLabel={ctrl.reviewsLabel}
            prefersArabicCopy={ctrl.prefersArabicCopy}
            distributionRows={ctrl.distributionRows}
            sectionVariant={ctrl.sectionVariant}
            isContentCentered={ctrl.isContentCentered}
            title={ctrl.title}
            showWriteReviewButton={ctrl.showWriteReviewButton}
            writeReviewText={ctrl.writeReviewText}
            setIsReviewDialogOpen={ctrl.setIsReviewDialogOpen}
            isElessiStoryGrid={ctrl.isElessiStoryGrid}
            elessiPreviewMedia={ctrl.elessiPreviewMedia}
            isElessiPlantReviews={ctrl.isElessiPlantReviews}
            isElessiProofWall={ctrl.isElessiProofWall}
            isElessiTrustPile={ctrl.isElessiTrustPile}
            isScentNotesVariant={ctrl.isScentNotesVariant}
            isVoiceNotesVariant={ctrl.isVoiceNotesVariant}
            isCommandProofVariant={ctrl.isCommandProofVariant}
            isStoryNotesVariant={ctrl.isStoryNotesVariant}
            isCompactVariant={ctrl.isCompactVariant}
            ratedByCustomersText={ctrl.ratedByCustomersText}
            trustedBadgeSubtitle={ctrl.trustedBadgeSubtitle}
            trustedBadgeItems={ctrl.trustedBadgeItems}
            trustedBadgeTitle={ctrl.trustedBadgeTitle}
            ratingBreakdownTitle={ctrl.ratingBreakdownTitle}
          />

          <ReviewsMediaFeed
            showMediaFeed={ctrl.showMediaFeed}
            shouldShowLoading={ctrl.shouldShowLoading}
            mediaFeed={ctrl.mediaFeed}
            isContentCentered={ctrl.isContentCentered}
            mediaTitle={ctrl.mediaTitle}
            mediaDescription={ctrl.mediaDescription}
            prefersArabicCopy={ctrl.prefersArabicCopy}
            galleryStyle={ctrl.galleryStyle}
          />

          <ReviewsList
            isZenOrganic={ctrl.isZenOrganic}
            shouldShowLoading={ctrl.shouldShowLoading}
            visibleReviews={ctrl.visibleReviews}
            reviews={ctrl.reviews}
            listTitle={ctrl.listTitle}
            showingReviewsText={ctrl.showingReviewsText}
            setIsReviewDialogOpen={ctrl.setIsReviewDialogOpen}
            writeReviewText={ctrl.writeReviewText}
            sortByText={ctrl.sortByText}
            newestText={ctrl.newestText}
            isElessiStoryGrid={ctrl.isElessiStoryGrid}
            showingRangeText={ctrl.showingRangeText}
            prefersArabicCopy={ctrl.prefersArabicCopy}
            isContentCentered={ctrl.isContentCentered}
            isCompactVariant={ctrl.isCompactVariant}
            mobileReviewLimit={ctrl.mobileReviewLimit}
            mobileShowingReviewsText={ctrl.mobileShowingReviewsText}
            compactLayoutText={ctrl.compactLayoutText}
            shouldUseCompactEmptyReviews={ctrl.shouldUseCompactEmptyReviews}
            emptyText={ctrl.emptyText}
            showWriteReviewButton={ctrl.showWriteReviewButton}
            reviewGridClassName={ctrl.reviewGridClassName}
            allowPhotoReviews={ctrl.allowPhotoReviews}
            allowVideoReviews={ctrl.allowVideoReviews}
            reviewCardClassName={ctrl.reviewCardClassName}
            isStoryNotesVariant={ctrl.isStoryNotesVariant}
            isScentNotesVariant={ctrl.isScentNotesVariant}
            isVoiceNotesVariant={ctrl.isVoiceNotesVariant}
            isCommandProofVariant={ctrl.isCommandProofVariant}
            showVerifiedBadge={ctrl.showVerifiedBadge}
            verifiedZenText={ctrl.verifiedZenText}
            verifiedLabel={ctrl.verifiedLabel}
            customerFeedbackText={ctrl.customerFeedbackText}
            defaultFeedbackText={ctrl.defaultFeedbackText}
            galleryStyle={ctrl.galleryStyle}
            helpfulCustomersText={ctrl.helpfulCustomersText}
            ratingOnlyCommentText={ctrl.ratingOnlyCommentText}
            helpfulPeopleText={ctrl.helpfulPeopleText}
          />
        </div>
      </div>

      <WriteReviewDialog
        open={ctrl.isReviewDialogOpen}
        onOpenChange={ctrl.setIsReviewDialogOpen}
        productId={ctrl.targetReviewProductId}
        onSubmitted={ctrl.handleReviewSubmitted}
      />
    </section>
  );
};

export default ReviewsSection;
