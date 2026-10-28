import type { Company } from "../../types";

export interface CompaniesTableProps {
  companies: Company[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  isAllVisibleSelected: boolean;
  isSomeVisibleSelected: boolean;
  loading: boolean;
  searchQuery?: string;
  onOpenDetails: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onOpenUsers: (company: Company) => void;
  onOpenFollowUp: (company: Company) => void;
  onOpenFacebookPages: (company: Company) => void;
  onOpenWhatsApp?: (company: Company) => void;
  onTransferOwnership: (company: Company) => void;
  onAddEmployee: (company: Company) => void;
  onLoginAsAdmin: (company: Company) => void;
  onRunFollowUpAction: (company: Company, action: "remind" | "escalate") => void;
  isMobile: boolean;
}

export interface ExpandedRowContentProps {
  company: Company;
  onOpenDetails: (c: Company) => void;
  onOpenFollowUp: (c: Company) => void;
  onOpenUsers: (c: Company) => void;
  onOpenFacebookPages: (c: Company) => void;
  onLoginAsAdmin: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
  onTransferOwnership: (c: Company) => void;
  onAddEmployee: (c: Company) => void;
  onRunFollowUpAction: (c: Company, a: "remind" | "escalate") => void;
  onOpenWhatsApp?: (c: Company) => void;
}
