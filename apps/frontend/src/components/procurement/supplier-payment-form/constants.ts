import {
  Banknote,
  Building2,
  CreditCard,
  FileText,
  Receipt,
} from "lucide-react";
import { PaymentMethodOption } from "./types";

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "CASH", label: "نقدي (كاش من الخزينة)", icon: Banknote },
  { value: "BANK_TRANSFER", label: "تحويل بنكي", icon: Building2 },
  { value: "INSTAPAY", label: "إنستاباي / محفظة إلكترونية", icon: CreditCard },
  { value: "CHECK", label: "شيك مصرفي", icon: FileText },
  { value: "OTHER", label: "أخرى", icon: Receipt },
];
