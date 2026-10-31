import { useState, useEffect } from "react";
import { apiClient } from "../../../../services/apiClient";
import {
  lookupCustomerByPhone,
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
  PreviousOrder,
  CustomerLookupResult,
} from "../../../../hooks/useCustomerByPhone";
import { detectUserGovernorate } from "../../../../utils/geolocation";
import { useAuth } from "../../../../hooks/useAuthSimple";
import {
  customerBlocklistService,
  CustomerBlockEvaluation,
} from "../../../../services/customerBlocklistService";

interface UseQuickOrderCustomerProps {
  isOpen: boolean;
  initialPhone?: string;
  initialCustomerName?: string;
  convCustomerName?: string;
  convId: string;
  paymentMethod: string;
}

export const useQuickOrderCustomer = ({
  isOpen,
  initialPhone,
  initialCustomerName,
  convCustomerName,
  convId,
  paymentMethod,
}: UseQuickOrderCustomerProps) => {
  const { user } = useAuth();
  const canOverrideBlockedCustomer = [
    "OWNER",
    "COMPANY_ADMIN",
    "SUPER_ADMIN",
    "MANAGER",
    "ADMIN",
  ].includes(user?.role || "");

  const [phone, setPhone] = useState(initialPhone || "");
  const [customerName, setCustomerName] = useState(
    initialCustomerName || convCustomerName || "",
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");

  const [checkingBlock, setCheckingBlock] = useState(false);
  const [customerBlock, setCustomerBlock] =
    useState<CustomerBlockEvaluation | null>(null);
  const [allowBlockedCustomerOverride, setAllowBlockedCustomerOverride] =
    useState(false);

  const [eligiblePreviousOrders, setEligiblePreviousOrders] = useState<
    EligiblePreviousOrder[]
  >([]);
  const [previousOrders, setPreviousOrders] = useState<PreviousOrder[]>([]);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerLookupResult | null>(null);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
  const [exchangeReturnPolicy, setExchangeReturnPolicy] =
    useState<ExchangeReturnPolicy | null>(null);
  const [selectedPreviousOrder, setSelectedPreviousOrder] =
    useState<string>("");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Preload order policy when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    apiClient
      .get("/order-settings")
      .then((res) => {
        if (active && res.data?.data?.exchangeReturnPolicy) {
          setExchangeReturnPolicy(res.data.data.exchangeReturnPolicy);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Sync customer data when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setPhone(initialPhone ? String(initialPhone) : "");
      setCustomerName(
        initialCustomerName
          ? String(initialCustomerName)
          : convCustomerName
            ? String(convCustomerName)
            : "",
      );
    }
  }, [isOpen, initialCustomerName, initialPhone, convCustomerName]);

  // Auto-detect governorate for quick checkout
  useEffect(() => {
    if (!isOpen || city) return;

    let cancelled = false;
    const detectGovernorate = async () => {
      const detected = await detectUserGovernorate();
      if (!cancelled && detected?.nameAr && !city) {
        setCity(detected.nameAr);
      }
    };

    void detectGovernorate();
    return () => {
      cancelled = true;
    };
  }, [isOpen, city]);

  // Auto-fill customer details and fetch full order history when phone number is entered
  useEffect(() => {
    const phoneStr = String(phone || "");
    const digits = phoneStr.replace(/\D/g, "");
    if (!isOpen || digits.length < 9) {
      setEligiblePreviousOrders([]);
      setPreviousOrders([]);
      setCustomerProfile(null);
      setLoadingCustomerOrders(false);
      return;
    }

    let cancelled = false;
    setLoadingCustomerOrders(true);
    const timeoutId = setTimeout(async () => {
      try {
        const customer = await lookupCustomerByPhone(phoneStr, convId);
        if (cancelled || !customer) return;

        setCustomerProfile(customer);

        const firstNameStr = String(customer.firstName || "").trim();
        const lastNameStr = String(customer.lastName || "").trim();
        const fullName = `${firstNameStr} ${lastNameStr}`.trim();
        if (fullName) {
          setCustomerName(fullName);
        }
        if (customer.address) {
          setAddress(String(customer.address));
        }
        if (customer.governorate || customer.city) {
          setCity(customer.governorate || customer.city || "");
        }
        if (customer.area || customer.city) {
          setArea(customer.area || customer.city || "");
        }
        if (customer.notes) {
          setNotes((prev) => String(prev || "").trim() || String(customer.notes));
        }

        if (customer.previousOrders && customer.previousOrders.length > 0) {
          setPreviousOrders(customer.previousOrders);
        } else {
          setPreviousOrders([]);
        }

        if (customer.eligiblePreviousOrders) {
          setEligiblePreviousOrders(customer.eligiblePreviousOrders);
          if (customer.eligiblePreviousOrders.length === 1) {
            setSelectedPreviousOrder(customer.eligiblePreviousOrders[0].id);
          }
        }
        if (customer.exchangeReturnPolicy) {
          setExchangeReturnPolicy(customer.exchangeReturnPolicy);
        }
      } catch (error) {
        console.error("Quick order customer lookup error:", error);
      } finally {
        if (!cancelled) {
          setLoadingCustomerOrders(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, phone, convId]);

  // Customer Blocklist check
  useEffect(() => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!isOpen || digits.length < 10) {
      setCustomerBlock(null);
      setAllowBlockedCustomerOverride(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setCheckingBlock(true);
        const result = await customerBlocklistService.check({
          phone: String(phone),
          source: "manual",
          paymentMethod,
        });

        if (!isCancelled) {
          setCustomerBlock(result?.rule || result?.blocked ? result : null);
          if (!result?.blocked) {
            setAllowBlockedCustomerOverride(false);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setCustomerBlock(null);
          setAllowBlockedCustomerOverride(false);
        }
      } finally {
        if (!isCancelled) {
          setCheckingBlock(false);
        }
      }
    }, 450);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, phone, paymentMethod]);

  return {
    phone,
    setPhone,
    customerName,
    setCustomerName,
    address,
    setAddress,
    city,
    setCity,
    area,
    setArea,
    notes,
    setNotes,
    checkingBlock,
    customerBlock,
    allowBlockedCustomerOverride,
    setAllowBlockedCustomerOverride,
    canOverrideBlockedCustomer,
    eligiblePreviousOrders,
    previousOrders,
    customerProfile,
    loadingCustomerOrders,
    exchangeReturnPolicy,
    selectedPreviousOrder,
    setSelectedPreviousOrder,
    showHistoryDrawer,
    setShowHistoryDrawer,
  };
};
