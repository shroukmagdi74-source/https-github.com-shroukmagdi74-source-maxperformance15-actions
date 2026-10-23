import React from 'react';
import QuickOrderModal from '../../../components/facebook-inbox/Modals/QuickOrderModal';
import QuickCreateTaskModal from '../../../components/facebook-inbox/Modals/QuickCreateTaskModal';
import ProductImagePickerModal from '../../../components/facebook-inbox/ProductImagePicker/ProductImagePickerModal';
import ImageGalleryModal from '../../../components/facebook-inbox/ImageGallery/ImageGalleryModal';
import CreateServiceOrderModal from '../../../components/facebook-inbox/Modals/CreateServiceOrderModal';
import type { ConversationDetail } from './types';

interface WhatsAppChatModalsProps {
  conversation: ConversationDetail;
  showOrderModal: boolean;
  onCloseOrderModal: () => void;
  showServiceOrderModal: boolean;
  onCloseServiceOrderModal: () => void;
  showQuickCreateTaskModal: boolean;
  onCloseTaskModal: () => void;
  showProductPicker: boolean;
  onCloseProductPicker: () => void;
  onSendProductImages: (
    product: { id: string; name: string; price: number | string },
    images: Array<{ url: string; filename: string }>,
    includeDetails: boolean,
  ) => void;
  showImageGallery: boolean;
  onCloseImageGallery: () => void;
  onSelectImageFromGallery: (url: string, filename: string) => void;
  onSelectMultipleImagesFromGallery: (images: Array<{ url: string; filename: string }>) => void;
  onReloadOrders: (customerId: string) => void;
}

export const WhatsAppChatModals: React.FC<WhatsAppChatModalsProps> = ({
  conversation,
  showOrderModal,
  onCloseOrderModal,
  showServiceOrderModal,
  onCloseServiceOrderModal,
  showQuickCreateTaskModal,
  onCloseTaskModal,
  showProductPicker,
  onCloseProductPicker,
  onSendProductImages,
  showImageGallery,
  onCloseImageGallery,
  onSelectImageFromGallery,
  onSelectMultipleImagesFromGallery,
  onReloadOrders,
}) => {
  return (
    <>
      {showOrderModal && (
        <QuickOrderModal
          isOpen={showOrderModal}
          onClose={onCloseOrderModal}
          customer={{
            id: conversation.customer.id,
            name: conversation.customer.name,
            phone: conversation.customer.phone,
          }}
          channel="whatsapp"
          channelConversationId={conversation.id}
          onSuccess={(orderId) => {
            onCloseOrderModal();
            if (conversation.customer?.id) {
              onReloadOrders(conversation.customer.id);
            }
          }}
        />
      )}

      {showServiceOrderModal && (
        <CreateServiceOrderModal
          isOpen={showServiceOrderModal}
          onClose={onCloseServiceOrderModal}
          customer={{
            id: conversation.customer.id,
            name: conversation.customer.name,
            phone: conversation.customer.phone,
          }}
          onSuccess={() => {
            onCloseServiceOrderModal();
            if (conversation.customer?.id) {
              onReloadOrders(conversation.customer.id);
            }
          }}
        />
      )}

      {showQuickCreateTaskModal && (
        <QuickCreateTaskModal
          isOpen={showQuickCreateTaskModal}
          onClose={onCloseTaskModal}
          defaultValues={{
            title: `متابعة محادثة واتساب: ${conversation.customer.name}`,
            relatedType: 'CUSTOMER',
            relatedId: conversation.customer.id,
          }}
        />
      )}

      {showProductPicker && (
        <ProductImagePickerModal
          isOpen={showProductPicker}
          onClose={onCloseProductPicker}
          onSendImages={onSendProductImages}
        />
      )}

      {showImageGallery && (
        <ImageGalleryModal
          isOpen={showImageGallery}
          onClose={onCloseImageGallery}
          onSelectImage={onSelectImageFromGallery}
          onSelectMultipleImages={onSelectMultipleImagesFromGallery}
        />
      )}
    </>
  );
};
