import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { FacebookPagePost } from "../../../../services/facebookAdsService";
import {
  StoreProductPickerModal,
  SelectedStoreProduct,
} from "../../../../components/advertising/ad/StoreProductPickerModal";
import { getCallToActions } from "../constants";
import { PagePostsSelector } from "./PagePostsSelector";
import { UtmBuilderModal } from "./UtmBuilderModal";
import {
  Step5CreativeProps,
  CreativeSourceType,
  useStep5MediaUpload,
  useStep5CarouselCards,
  useStep5FlexibleUpload,
  CreativePageSelector,
  CreativeSourceSelector,
  CreativeFormatSelector,
  CreativeMediaUploadSection,
  CreativeCarouselCardsSection,
  CreativeFlexibleAssetsSection,
  CreativeCopyAndDestinationSection,
  CreativeCallToActionSection,
  CreativeAdvantageEnhancementsSection,
  CreativePreviewSidebar,
} from "./step5-creative";

export const Step5Creative: React.FC<Step5CreativeProps> = ({
  formData,
  handleChange,
  getError,
  facebookPages,
  facebookPagesMeta,
  loadingPages,
  selectedFacebookPage,
}) => {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language && i18n.language.startsWith("en"));
  const callToActions = getCallToActions(isEn);

  const [creativeSource, setCreativeSource] = useState<CreativeSourceType>(
    formData.creativeType === "EXISTING_POST" ? "EXISTING_POST" : "NEW_AD",
  );
  const [showUtmModal, setShowUtmModal] = useState(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  // Modular upload and card management hooks
  const mediaUpload = useStep5MediaUpload({ formData, handleChange, isEn });
  const carouselCards = useStep5CarouselCards({ formData, handleChange, isEn });
  const flexibleUpload = useStep5FlexibleUpload({ formData, handleChange, isEn });

  const handleProductSelect = (product: SelectedStoreProduct) => {
    if (product.imageUrl) {
      handleChange("imageUrl", product.imageUrl);
    }
    if (product.landingUrl) {
      handleChange("linkUrl", product.landingUrl);
    }
    if (product.name) {
      if (!formData.adName) {
        handleChange("adName", `${product.name} - Ad`);
      }
      if (!formData.headline) {
        handleChange(
          "headline",
          `${product.name} - ${product.price.toLocaleString()} ج.م`,
        );
      }
      if (!formData.primaryText) {
        handleChange(
          "primaryText",
          product.description ||
            `اطلبي الآن ${product.name} بأفضل جودة وخامات ممتازة مع شحن سريع ومعاينة قبل الاستلام!`,
        );
      }
    }
    toast.success(
      isEn
        ? `Product "${product.name}" imported with image & link!`
        : `تم استيراد بيانات "${product.name}" وتعبئة الصورة والرابط بنجاح!`,
    );
  };

  const handleSelectPagePost = (post: FacebookPagePost) => {
    handleChange("postId", post.id);
    handleChange("creativeType", "EXISTING_POST");
    if (post.message) handleChange("primaryText", post.message);
    if (post.pictureUrl) handleChange("imageUrl", post.pictureUrl);
    if (post.permalinkUrl) handleChange("linkUrl", post.permalinkUrl);
  };

  const handleManualPostId = (postId: string) => {
    handleChange("postId", postId);
    handleChange("creativeType", "EXISTING_POST");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-5">
          <CreativePageSelector
            formData={formData}
            handleChange={handleChange}
            getError={getError}
            facebookPages={facebookPages}
            facebookPagesMeta={facebookPagesMeta}
            loadingPages={loadingPages}
            selectedFacebookPage={selectedFacebookPage}
            isEn={isEn}
          />

          <CreativeSourceSelector
            creativeSource={creativeSource}
            setCreativeSource={setCreativeSource}
            formData={formData}
            handleChange={handleChange}
            isEn={isEn}
          />

          {creativeSource === "EXISTING_POST" ? (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
              <PagePostsSelector
                pageId={formData.pageId}
                selectedPostId={formData.postId}
                onSelectPost={handleSelectPagePost}
                onManualPostIdChange={handleManualPostId}
                error={getError("postId")}
              />
            </div>
          ) : (
            <>
              <CreativeFormatSelector
                formData={formData}
                handleChange={handleChange}
                getError={getError}
                isEn={isEn}
              />

              {formData.creativeType === "FLEXIBLE" && (
                <CreativeFlexibleAssetsSection
                  formData={formData}
                  handleChange={handleChange}
                  isEn={isEn}
                  flexibleInputRef={flexibleUpload.flexibleInputRef}
                  handleFlexibleFilesUpload={flexibleUpload.handleFlexibleFilesUpload}
                  handleRemoveFlexibleAsset={flexibleUpload.handleRemoveFlexibleAsset}
                />
              )}

              {(formData.creativeType === "SINGLE_IMAGE" ||
                formData.creativeType === "SINGLE_VIDEO") && (
                <CreativeMediaUploadSection
                  formData={formData}
                  handleChange={handleChange}
                  getError={getError}
                  isEn={isEn}
                  onOpenProductPicker={() => setIsProductPickerOpen(true)}
                  fileInputRef={mediaUpload.fileInputRef}
                  uploading={mediaUpload.uploading}
                  uploadProgress={mediaUpload.uploadProgress}
                  isDragging={mediaUpload.isDragging}
                  uploadError={mediaUpload.uploadError}
                  handleMediaUpload={mediaUpload.handleMediaUpload}
                  handleDragOver={mediaUpload.handleDragOver}
                  handleDragLeave={mediaUpload.handleDragLeave}
                  handleDrop={mediaUpload.handleDrop}
                />
              )}

              {formData.creativeType === "CAROUSEL" && (
                <CreativeCarouselCardsSection
                  formData={formData}
                  handleChange={handleChange}
                  getError={getError}
                  isEn={isEn}
                  uploadingCardId={carouselCards.uploadingCardId}
                  handleCardImageUpload={carouselCards.handleCardImageUpload}
                  handleAddCard={carouselCards.handleAddCard}
                  handleRemoveCard={carouselCards.handleRemoveCard}
                  handleUpdateCard={carouselCards.handleUpdateCard}
                />
              )}

              <CreativeCopyAndDestinationSection
                formData={formData}
                handleChange={handleChange}
                getError={getError}
                isEn={isEn}
                onOpenUtmModal={() => setShowUtmModal(true)}
              />
            </>
          )}

          <CreativeCallToActionSection
            formData={formData}
            handleChange={handleChange}
            callToActions={callToActions}
            isEn={isEn}
          />

          <CreativeAdvantageEnhancementsSection
            formData={formData}
            handleChange={handleChange}
            isEn={isEn}
          />
        </div>

        {/* Right Column - Preview & Advantage+ Options */}
        <CreativePreviewSidebar
          formData={formData}
          handleChange={handleChange}
          pageName={selectedFacebookPage?.name || ""}
          creativeSource={creativeSource}
          isEn={isEn}
        />
      </div>

      {/* UTM Dynamic Macro Builder Modal */}
      <UtmBuilderModal
        isOpen={showUtmModal}
        onClose={() => setShowUtmModal(false)}
        currentValue={formData.urlParameters}
        onApply={(val) => handleChange("urlParameters", val)}
      />

      {/* Store Product Picker Modal */}
      <StoreProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        onSelect={handleProductSelect}
        isEn={isEn}
      />
    </div>
  );
};
