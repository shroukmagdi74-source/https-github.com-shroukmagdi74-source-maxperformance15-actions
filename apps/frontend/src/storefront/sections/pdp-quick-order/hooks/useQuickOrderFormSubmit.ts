import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { storefrontApi, getCartId } from '../../../../utils/storefrontApi';
import { buildCheckoutOrderPayload } from '../../../hooks/useCheckout';
import { buildStorefrontPath } from '../../../utils/paths';
import { resolvePostPurchaseTarget } from '../../../utils/postPurchaseOffer';
import { trackConversionSuiteUsage } from '../../../utils/conversionSuiteTracking';
import { buildQuantityOfferCartItems } from '../../../utils/quantityOfferCartItems';
import { persistPurchaseTracking } from '../../../utils/purchaseTrackingStorage';
import type { CartItem } from '../../../store/useCartStore';
import {
  buildQuickOrderNote,
  isValidEgyptianPhone,
} from '../quickOrderHelpers';
import type { PublicOrderResponse, QuickOrderPaymentMethod } from '../quickOrderTypes';

export const useQuickOrderFormSubmit = ({
  product,
  activeQuantityOffer,
  trackingItem,
  customAttributeValues,
  isOutOfStock,
  isSelectionReady,
  effectiveFullNameField,
  effectivePhoneField,
  effectiveAlternatePhoneField,
  effectiveGovernorateField,
  effectiveAddressField,
  resolvedFullName,
  resolvedPhone,
  contactPhone,
  resolvedAlternatePhone,
  resolvedGovernorate,
  resolvedAddress,
  minimumOrder,
  customAttributes,
  customAttributesSummary,
  attributeSummary,
  paymentMethod,
  walletProofUploading,
  walletProofImageUrl,
  walletPaymentSettings,
  walletTransferRef,
  effectiveShippingCost,
  resolvedSubtotal,
  total,
  companyId,
  marketplacePreviewThemeId,
  quickOrderFingerprint,
  trackInitiateCheckoutEvent,
  trackAddToCartEvent,
  storefrontSettings,
  resetCheckout,
  setAlternatePhone,
  setQuantity,
  addItem,
  prefersArabicCopy,
  fallbackCustomerName,
}: {
  product: any;
  activeQuantityOffer: any;
  trackingItem: CartItem | null;
  customAttributeValues: Record<string, string>;
  isOutOfStock: boolean;
  isSelectionReady: boolean;
  effectiveFullNameField: { enabled: boolean; required: boolean };
  effectivePhoneField: { enabled: boolean; required: boolean };
  effectiveAlternatePhoneField: { enabled: boolean; required: boolean };
  effectiveGovernorateField: { enabled: boolean; required: boolean };
  effectiveAddressField: { enabled: boolean; required: boolean };
  resolvedFullName: string;
  resolvedPhone: string;
  contactPhone: string;
  resolvedAlternatePhone: string;
  resolvedGovernorate: string;
  resolvedAddress: string;
  minimumOrder: any;
  customAttributes: any[];
  customAttributesSummary: string;
  attributeSummary: string;
  paymentMethod: QuickOrderPaymentMethod;
  walletProofUploading: boolean;
  walletProofImageUrl: string;
  walletPaymentSettings: any;
  walletTransferRef: string;
  effectiveShippingCost: number;
  resolvedSubtotal: number;
  total: number;
  companyId: string;
  marketplacePreviewThemeId: string | null;
  quickOrderFingerprint: string;
  trackInitiateCheckoutEvent: (payload: any) => any;
  trackAddToCartEvent: (payload: any) => any;
  storefrontSettings: any;
  resetCheckout: () => void;
  setAlternatePhone: (val: string) => void;
  setQuantity: (val: number) => void;
  addItem: (item: CartItem, options?: any) => void;
  prefersArabicCopy: boolean;
  fallbackCustomerName: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const trackedCheckoutFingerprintRef = useRef('');

  const buildQuickOrderCartItemsForSubmit = (): CartItem[] | null => {
    if (activeQuantityOffer) {
      const builtOfferItems = buildQuantityOfferCartItems({
        product,
        quantityOfferSelection: activeQuantityOffer,
      });

      if (!builtOfferItems?.items?.length) {
        toast.error(
          prefersArabicCopy
            ? 'أكمل اختيار كل قطعة داخل العرض أولًا.'
            : 'Complete the offer selection first.',
        );
        return null;
      }

      return builtOfferItems.items.map((item) => ({
        ...item,
        attributes: {
          ...(item.attributes || {}),
          ...customAttributeValues,
        },
      }));
    }

    if (!trackingItem) {
      toast.error(
        prefersArabicCopy
          ? 'اختر اللون أو المقاس من خيارات المنتج بالأعلى أولًا.'
          : 'Choose the color or size from the product options above first.',
      );
      return null;
    }

    return [
      {
        ...trackingItem,
        attributes: {
          ...(trackingItem.attributes || {}),
          ...customAttributeValues,
        },
      },
    ];
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!isSelectionReady) {
      errors.push(
        activeQuantityOffer
          ? prefersArabicCopy
            ? 'يرجى استكمال اختيار كل قطعة داخل العرض أولًا.'
            : 'Please complete each item selection inside the offer first.'
          : prefersArabicCopy
            ? 'يرجى اختيار اللون أو المقاس من خيارات المنتج بالأعلى أولًا.'
            : 'Please choose the color or size from the product options above first.',
      );
    }

    if (
      effectiveFullNameField.enabled &&
      effectiveFullNameField.required &&
      !resolvedFullName
    ) {
      errors.push(
        prefersArabicCopy
          ? 'يرجى إدخال الاسم بالكامل.'
          : 'Please enter the full name.',
      );
    }

    if (effectivePhoneField.enabled && effectivePhoneField.required && !resolvedPhone) {
      errors.push(
        prefersArabicCopy
          ? 'يرجى إدخال رقم الهاتف.'
          : 'Please enter the phone number.',
      );
    }

    if (
      effectivePhoneField.enabled &&
      resolvedPhone &&
      !isValidEgyptianPhone(resolvedPhone)
    ) {
      errors.push(
        prefersArabicCopy
          ? 'رقم الهاتف يجب أن يكون رقم موبايل مصري صحيحًا.'
          : 'Phone number must be a valid Egyptian mobile number.',
      );
    }

    if (
      effectiveAlternatePhoneField.enabled &&
      effectiveAlternatePhoneField.required &&
      !contactPhone
    ) {
      errors.push(
        prefersArabicCopy
          ? 'يرجى إدخال رقم هاتف صالح للتواصل.'
          : 'Please provide a valid contact phone number.',
      );
    }

    if (
      effectiveAlternatePhoneField.enabled &&
      resolvedAlternatePhone &&
      !isValidEgyptianPhone(resolvedAlternatePhone)
    ) {
      errors.push(
        prefersArabicCopy
          ? 'رقم الهاتف البديل غير صحيح.'
          : 'Alternate phone number is invalid.',
      );
    }

    if (
      effectiveGovernorateField.enabled &&
      effectiveGovernorateField.required &&
      !resolvedGovernorate
    ) {
      errors.push(
        prefersArabicCopy
          ? 'يرجى اختيار المحافظة.'
          : 'Please select a governorate.',
      );
    }

    if (
      effectiveAddressField.enabled &&
      effectiveAddressField.required &&
      (!resolvedAddress || resolvedAddress.trim().length < 5)
    ) {
      errors.push(
        prefersArabicCopy
          ? 'يرجى إدخال العنوان بالتفصيل (5 أحرف على الأقل).'
          : 'Please enter the detailed address (at least 5 characters).',
      );
    }

    if (minimumOrder.blocked) {
      errors.push(minimumOrder.message);
    }

    if (isOutOfStock) {
      errors.push(
        prefersArabicCopy
          ? 'عذرًا، هذا المنتج نفد من المخزون حاليًا.'
          : 'Sorry, this product is currently out of stock.',
      );
    }

    customAttributes.forEach((attr: any) => {
      if (attr.required && !customAttributeValues[attr.key]?.trim()) {
        errors.push(
          prefersArabicCopy
            ? `يرجى إدخال ${attr.label}.`
            : `Please enter ${attr.label}.`,
        );
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    if (isOutOfStock) {
      toast.error(
        prefersArabicCopy
          ? 'عذرًا، نفدت كمية هذا المنتج حاليًا وغير متاح للطلب.'
          : 'Sorry, this product is currently out of stock.',
      );
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      if (minimumOrder.blocked) {
        toast.error(minimumOrder.message);
      } else if (paymentMethod === 'card') {
        toast.error(
          prefersArabicCopy
            ? 'يرجى استكمال بيانات التوصيل المطلوبة أولاً للانتقال إلى صفحة الدفع بالبطاقة.'
            : 'Please complete required delivery details first to proceed to card payment.',
        );
      } else {
        toast.error(
          prefersArabicCopy
            ? 'يرجى استكمال بيانات التوصيل المطلوبة لتأكيد طلبك.'
            : 'Please complete required delivery details to confirm your order.',
        );
      }

      if (typeof window !== 'undefined') {
        const checkoutTarget =
          document.getElementById('pdp-checkout') ||
          document.querySelector('[data-section="pdp-checkout"]') ||
          document.querySelector('#storefront-pdp-checkout');

        if (checkoutTarget) {
          checkoutTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => {
            const firstInput = checkoutTarget.querySelector<HTMLInputElement | HTMLSelectElement>(
              'input[name="customerName"], input[name="phone"], select[name="governorate"], input[name="address"]',
            );
            if (firstInput && !firstInput.value?.trim()) {
              firstInput.focus();
            }
          }, 450);
        }
      }

      return;
    }

    isSubmittingRef.current = true;
    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      if (paymentMethod === 'wallet') {
        if (walletProofUploading) {
          setValidationErrors([
            prefersArabicCopy
              ? 'جارٍ رفع صورة الإيصال، انتظر قليلًا.'
              : 'Uploading the receipt, please wait.',
          ]);
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
        if (!walletProofImageUrl) {
          setValidationErrors([
            prefersArabicCopy
              ? 'يرجى رفع صورة إيصال التحويل لإتمام الدفع بالمحفظة.'
              : 'Please upload the transfer receipt to pay by wallet.',
          ]);
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }
      const quickOrderItems = buildQuickOrderCartItemsForSubmit();
      if (!quickOrderItems?.length) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
      const totalQuantity = quickOrderItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      );
      const checkoutItems = quickOrderItems.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      if (
        quickOrderFingerprint &&
        trackedCheckoutFingerprintRef.current !== quickOrderFingerprint
      ) {
        try {
          const eventId = trackInitiateCheckoutEvent({
            items: checkoutItems,
            total: resolvedSubtotal,
          });

          if (eventId !== undefined) {
            trackedCheckoutFingerprintRef.current = quickOrderFingerprint;
          }
        } catch (trackErr) {
          console.warn(
            '[PdpQuickOrderForm] Failed to track initiate checkout:',
            trackErr,
          );
        }
      }

      const pixelEventId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const payload = buildCheckoutOrderPayload(
        {
          customerName: resolvedFullName || fallbackCustomerName,
          email: '',
          phone: contactPhone,
          phone2:
            effectiveAlternatePhoneField.enabled && resolvedAlternatePhone
              ? resolvedAlternatePhone
              : undefined,
          address: resolvedAddress,
          city: resolvedGovernorate,
          governorate: resolvedGovernorate,
          notes: buildQuickOrderNote({
            alternatePhone:
              effectiveAlternatePhoneField.enabled && resolvedAlternatePhone
                ? resolvedAlternatePhone
                : '',
            attributeSummary,
            quantityOfferLabel: activeQuantityOffer?.offerLabel || '',
            customAttributesSummary,
          }),
          paymentMethod,
          shippingCost: effectiveShippingCost,
          subtotal: resolvedSubtotal,
          total,
          ...(paymentMethod === 'wallet' && walletProofImageUrl
            ? {
                walletProof: {
                  imageUrl: walletProofImageUrl,
                  walletNumber: walletPaymentSettings?.walletNumber || undefined,
                  transferRef: walletTransferRef.trim() || undefined,
                },
              }
            : {}),
        },
        quickOrderItems,
        resolvedSubtotal,
        companyId,
        pixelEventId,
      );

      let previewResponse: PublicOrderResponse | null = null;
      if (marketplacePreviewThemeId) {
        try {
          const previewModule = await import(
            '../../../preview/marketplacePreviewOrder'
          );
          if (previewModule?.createMarketplacePreviewOrderResponse) {
            previewResponse =
              previewModule.createMarketplacePreviewOrderResponse(
                {
                  guestName: resolvedFullName || fallbackCustomerName,
                  guestEmail: '',
                  guestPhone: contactPhone,
                  guestPhone2:
                    effectiveAlternatePhoneField.enabled && resolvedAlternatePhone
                      ? resolvedAlternatePhone
                      : undefined,
                  paymentMethod,
                  notes: payload.notes,
                  shippingAddress: {
                    governorate: resolvedGovernorate || undefined,
                    city: resolvedGovernorate || undefined,
                    street: resolvedAddress || undefined,
                    address: resolvedAddress || undefined,
                    addressLine1: resolvedAddress || undefined,
                    phone2:
                      effectiveAlternatePhoneField.enabled &&
                      resolvedAlternatePhone
                        ? resolvedAlternatePhone
                        : undefined,
                  },
                  items: quickOrderItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId || undefined,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.imageUrl,
                    productImage: item.imageUrl,
                    attributes: item.attributes || {},
                    quantityOffer: item.quantityOffer || undefined,
                  })),
                  subtotal: resolvedSubtotal,
                  shippingCost: effectiveShippingCost,
                  total,
                },
                marketplacePreviewThemeId,
              ) as PublicOrderResponse | null;
          }
        } catch (previewErr) {
          console.warn(
            '[PdpQuickOrderForm] preview order simulation failed, falling back to storefrontApi:',
            previewErr,
          );
        }
      }

      if (paymentMethod === 'card' && !marketplacePreviewThemeId) {
        const cartId = getCartId();
        const cardPayload = {
          guestName: payload.guestName || resolvedFullName || fallbackCustomerName,
          guestEmail: payload.guestEmail || undefined,
          guestPhone: payload.guestPhone || contactPhone,
          customerName: payload.guestName || resolvedFullName || fallbackCustomerName,
          phone: payload.guestPhone || contactPhone,
          shippingAddress: {
            governorate: resolvedGovernorate || undefined,
            city: resolvedGovernorate || undefined,
            street: resolvedAddress || undefined,
            address: resolvedAddress || undefined,
            phone2: effectiveAlternatePhoneField.enabled && resolvedAlternatePhone ? resolvedAlternatePhone : undefined,
          },
          items: quickOrderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.imageUrl,
            attributes: item.attributes || {},
            quantityOffer: item.quantityOffer || undefined,
          })),
          subtotal: resolvedSubtotal,
          shippingCost: effectiveShippingCost,
          total,
          cartId,
          pixelEventId,
          notes: payload.notes,
        };

        const cardResponse = (await storefrontApi.kashierCheckout(cardPayload)) as any;
        if (cardResponse?.success && cardResponse?.data?.sessionUrl) {
          window.location.href = cardResponse.data.sessionUrl;
          return;
        } else {
          throw new Error(
            cardResponse?.error ||
            cardResponse?.message ||
            (prefersArabicCopy ? 'تعذر إنشاء جلسة الدفع بالبطاقة. يرجى التحقق من إعدادات بوابة الدفع.' : 'Failed to initiate card payment session.'),
          );
        }
      }

      const response = previewResponse
        ? previewResponse
        : ((await storefrontApi.createOrder(payload)) as PublicOrderResponse);
      if (!response?.success) {
        throw new Error(
          response?.message ||
            response?.error ||
            (prefersArabicCopy
              ? 'تعذر إرسال الطلب الآن.'
              : 'Could not submit the order right now.'),
        );
      }

      const resolvedOrderId =
        response.data?.orderNumber || response.data?.id || 'success';
      const resolvedOrderTotal = Number(
        response.data?.finalTotal ?? response.data?.total ?? total,
      );
      const targetRoute = resolvePostPurchaseTarget(storefrontSettings, [
        { productId: product?.id },
      ]);
      const thankYouPath = buildStorefrontPath(
        location.pathname,
        `${targetRoute}?orderId=${encodeURIComponent(String(resolvedOrderId))}`,
        location.search,
      );

      void trackConversionSuiteUsage(storefrontSettings, {
        feature: 'pdp_quick_order_submit',
        metadata: {
          productId: product.id,
          offerId: activeQuantityOffer?.offerId,
          quantity: totalQuantity,
          subtotal: resolvedSubtotal,
          total: resolvedOrderTotal,
        },
      });

      resetCheckout();
      setAlternatePhone('');
      setQuantity(1);
      toast.success(
        prefersArabicCopy
          ? 'تم إرسال الطلب بنجاح.'
          : 'Order submitted successfully.',
      );
      const purchaseTracking = {
        eventId: pixelEventId,
        orderNumber: String(resolvedOrderId),
        companyId: companyId || undefined,
        total: resolvedOrderTotal,
        phone: contactPhone,
        customerName: resolvedFullName || fallbackCustomerName,
        paymentMethod,
        items: [
          ...quickOrderItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId || undefined,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
            attributes: item.attributes || {},
            quantityOffer: item.quantityOffer || undefined,
          })),
        ],
      };
      persistPurchaseTracking(purchaseTracking, companyId);

      if (typeof window !== 'undefined') {
        window.location.assign(thankYouPath);
        return;
      }

      navigate(thankYouPath, {
        state: {
          purchaseTracking,
        },
      });
    } catch (error) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      const message =
        error instanceof Error
          ? error.message
          : prefersArabicCopy
            ? 'حدث خطأ أثناء إرسال الطلب.'
            : 'An error occurred while submitting the order.';
      toast.error(message);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error(
        prefersArabicCopy
          ? 'عذرًا، نفدت كمية هذا المنتج حاليًا وغير متاح للطلب.'
          : 'Sorry, this product is currently out of stock.',
      );
      return;
    }

    const quickOrderItems = buildQuickOrderCartItemsForSubmit();
    if (!quickOrderItems?.length) {
      return;
    }

    quickOrderItems.forEach((item, index) => {
      addItem(item, { openCart: index === quickOrderItems.length - 1 });
    });
    const totalQuantity = quickOrderItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    trackAddToCartEvent({
      id: product.id,
      name: product.name,
      price: resolvedSubtotal,
      quantity: totalQuantity,
    });
    void trackConversionSuiteUsage(storefrontSettings, {
      feature: 'pdp_quick_order_add_to_cart',
      metadata: {
        productId: product.id,
        offerId: activeQuantityOffer?.offerId,
        quantity: totalQuantity,
        subtotal: resolvedSubtotal,
      },
    });
    toast.success(
      activeQuantityOffer
        ? prefersArabicCopy
          ? 'تمت إضافة العرض إلى السلة.'
          : 'Offer added to cart.'
        : prefersArabicCopy
          ? 'تمت إضافة المنتج إلى السلة.'
          : 'Product added to cart.',
    );
  };

  return {
    isSubmitting,
    validationErrors,
    setValidationErrors,
    handleSubmit,
    handleAddToCart,
  };
};
