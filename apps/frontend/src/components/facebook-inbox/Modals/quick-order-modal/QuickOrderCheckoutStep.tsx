import React from "react";
import { QuickOrderCustomerForm } from "./QuickOrderCustomerForm";
import { QuickOrderDeliveryForm } from "./QuickOrderDeliveryForm";
import { QuickOrderPaymentForm } from "./QuickOrderPaymentForm";
import {
  CartItem,
  CouponInfo,
  ShippingInfo,
} from "./types";
import {
  CustomerLookupResult,
  PreviousOrder,
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
} from "../../../../hooks/useCustomerByPhone";
import { CustomerBlockEvaluation } from "../../../../services/customerBlocklistService";

interface QuickOrderCheckoutStepProps {
  // Customer props
  phone: string;
  setPhone: (phone: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  loadingCustomerOrders: boolean;
  customerProfile: CustomerLookupResult | null;
  previousOrders: PreviousOrder[];
  checkingBlock: boolean;
  customerBlock: CustomerBlockEvaluation | null;
  allowBlockedCustomerOverride: boolean;
  setAllowBlockedCustomerOverride: (allow: boolean) => void;
  canOverrideBlockedCustomer: boolean;

  // Delivery props
  city: string;
  setCity: (city: string) => void;
  area: string;
  setArea: (area: string) => void;
  address: string;
  setAddress: (address: string) => void;
  shippingInfo: ShippingInfo | null;
  loadingShipping: boolean;
  isScheduledOrder: boolean;
  setIsScheduledOrder: (isScheduled: boolean) => void;
  scheduledDeliveryDate: string;
  setScheduledDeliveryDate: (date: string) => void;
  scheduledDeliveryTime: string;
  setScheduledDeliveryTime: (time: string) => void;
  scheduledNotes: string;
  setScheduledNotes: (notes: string) => void;
  notes: string;
  setNotes: (notes: string) => void;

  // Payment props
  cartItems: CartItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  grandTotal: number;
  appliedCoupon: CouponInfo | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  loadingCoupon: boolean;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  manualDiscount: number;
  setManualDiscount: (discount: number) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  status: string;
  setStatus: (status: string) => void;
  requestType: string;
  setRequestType: (type: string) => void;
  returnAmount: string;
  setReturnAmount: (amount: string) => void;
  isExchangeOrReturn: boolean;
  phoneDigitsCount: number;
  previousOrderMissing: boolean;
  exchangeReturnPolicy: ExchangeReturnPolicy | null;
  eligiblePreviousOrders: EligiblePreviousOrder[];
  selectedPreviousOrder: string;
  setSelectedPreviousOrder: (orderId: string) => void;
  selectedOrderObj?: EligiblePreviousOrder;
}

export const QuickOrderCheckoutStep: React.FC<QuickOrderCheckoutStepProps> = (
  props,
) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <QuickOrderCustomerForm
          phone={props.phone}
          setPhone={props.setPhone}
          customerName={props.customerName}
          setCustomerName={props.setCustomerName}
          loadingCustomerOrders={props.loadingCustomerOrders}
          customerProfile={props.customerProfile}
          previousOrders={props.previousOrders}
          checkingBlock={props.checkingBlock}
          customerBlock={props.customerBlock}
          allowBlockedCustomerOverride={props.allowBlockedCustomerOverride}
          setAllowBlockedCustomerOverride={props.setAllowBlockedCustomerOverride}
          canOverrideBlockedCustomer={props.canOverrideBlockedCustomer}
        />

        <QuickOrderDeliveryForm
          city={props.city}
          setCity={props.setCity}
          area={props.area}
          setArea={props.setArea}
          address={props.address}
          setAddress={props.setAddress}
          shippingInfo={props.shippingInfo}
          loadingShipping={props.loadingShipping}
          isScheduledOrder={props.isScheduledOrder}
          setIsScheduledOrder={props.setIsScheduledOrder}
          scheduledDeliveryDate={props.scheduledDeliveryDate}
          setScheduledDeliveryDate={props.setScheduledDeliveryDate}
          scheduledDeliveryTime={props.scheduledDeliveryTime}
          setScheduledDeliveryTime={props.setScheduledDeliveryTime}
          scheduledNotes={props.scheduledNotes}
          setScheduledNotes={props.setScheduledNotes}
          notes={props.notes}
          setNotes={props.setNotes}
        />

        <QuickOrderPaymentForm
          cartItems={props.cartItems}
          subtotal={props.subtotal}
          totalDiscount={props.totalDiscount}
          shippingCost={props.shippingCost}
          grandTotal={props.grandTotal}
          appliedCoupon={props.appliedCoupon}
          couponCode={props.couponCode}
          setCouponCode={props.setCouponCode}
          loadingCoupon={props.loadingCoupon}
          handleApplyCoupon={props.handleApplyCoupon}
          handleRemoveCoupon={props.handleRemoveCoupon}
          manualDiscount={props.manualDiscount}
          setManualDiscount={props.setManualDiscount}
          paymentMethod={props.paymentMethod}
          setPaymentMethod={props.setPaymentMethod}
          status={props.status}
          setStatus={props.setStatus}
          requestType={props.requestType}
          setRequestType={props.setRequestType}
          returnAmount={props.returnAmount}
          setReturnAmount={props.setReturnAmount}
          shippingInfo={props.shippingInfo}
          isExchangeOrReturn={props.isExchangeOrReturn}
          phoneDigitsCount={props.phoneDigitsCount}
          previousOrderMissing={props.previousOrderMissing}
          exchangeReturnPolicy={props.exchangeReturnPolicy}
          eligiblePreviousOrders={props.eligiblePreviousOrders}
          selectedPreviousOrder={props.selectedPreviousOrder}
          setSelectedPreviousOrder={props.setSelectedPreviousOrder}
          selectedOrderObj={props.selectedOrderObj}
        />
      </div>
    </div>
  );
};
