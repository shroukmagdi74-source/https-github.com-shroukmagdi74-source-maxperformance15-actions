import { useQuickOrderProducts } from "./useQuickOrderProducts";
import { useQuickOrderCart } from "./useQuickOrderCart";
import { useQuickOrderCustomer } from "./useQuickOrderCustomer";
import { useQuickOrderCheckout } from "./useQuickOrderCheckout";
import { QuickOrderModalProps } from "./types";

export const useQuickOrderModal = ({
  isOpen,
  onClose,
  conversation,
  customerName: initialCustomerName,
  customerPhone: initialCustomerPhone,
  conversationId: propConvId,
  customerId: propCustomerId,
  platform: propPlatform,
  pageName: propPageName,
  onOrderCreated,
}: QuickOrderModalProps) => {
  const convId = conversation?.id || propConvId || "";
  const convCustomerId = conversation?.customerId || propCustomerId || "";
  const convCustomerName = conversation?.customerName || "";
  const convPageName = conversation?.pageName || propPageName || "Facebook";
  const convPlatform = conversation?.platform || propPlatform || "facebook";

  const productsState = useQuickOrderProducts(isOpen);
  const cartState = useQuickOrderCart();

  const customerState = useQuickOrderCustomer({
    isOpen,
    initialPhone: initialCustomerPhone,
    initialCustomerName,
    convCustomerName,
    convId,
    paymentMethod: "CASH",
  });

  const checkoutState = useQuickOrderCheckout({
    isOpen,
    convId,
    convCustomerId,
    convPlatform,
    cartItems: cartState.cartItems,
    phone: customerState.phone,
    customerName: customerState.customerName,
    address: customerState.address,
    city: customerState.city,
    area: customerState.area,
    notes: customerState.notes,
    customerBlock: customerState.customerBlock,
    allowBlockedCustomerOverride: customerState.allowBlockedCustomerOverride,
    canOverrideBlockedCustomer: customerState.canOverrideBlockedCustomer,
    eligiblePreviousOrders: customerState.eligiblePreviousOrders,
    exchangeReturnPolicy: customerState.exchangeReturnPolicy,
    selectedPreviousOrder: customerState.selectedPreviousOrder,
    onOrderCreated,
  });

  return {
    convId,
    convCustomerName,
    convPageName,
    convPlatform,
    ...productsState,
    ...cartState,
    ...customerState,
    ...checkoutState,
  };
};
