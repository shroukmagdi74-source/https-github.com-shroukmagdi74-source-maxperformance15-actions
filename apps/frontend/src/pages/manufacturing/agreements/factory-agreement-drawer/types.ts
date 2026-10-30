import type {
  FactoryAgreement,
  FactoryAgreementPayment,
  FactoryAgreementFile,
} from "../../manufacturingApi";

export type AgreementTab = "payments" | "terms" | "files";

export interface FactoryAgreementDrawerProps {
  agreementId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export type { FactoryAgreement, FactoryAgreementPayment, FactoryAgreementFile };
