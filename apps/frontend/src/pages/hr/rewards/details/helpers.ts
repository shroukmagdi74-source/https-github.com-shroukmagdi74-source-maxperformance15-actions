import { RewardUiStatus } from "../rewardRecordUtils";
import { RewardDetailsRecord } from "./types";

export const REWARD_DETAILS_STATUS_CONFIG: Record<
  RewardUiStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "قيد الانتظار",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  APPROVED: {
    label: "معتمد",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  APPLIED: {
    label: "مطبق",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  REJECTED: {
    label: "مرفوض",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  VOIDED: {
    label: "ملغي",
    className: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export const formatCalculationDetails = (
  calculationDetails?: string,
): string | null => {
  if (!calculationDetails) return null;
  try {
    return JSON.stringify(JSON.parse(calculationDetails), null, 2);
  } catch {
    return calculationDetails;
  }
};

export const deriveRewardTypeMeta = (reward: RewardDetailsRecord) => ({
  rewardTypeName:
    reward.rewardType?.name || reward.rewardName || "مكافأة مخصصة",
  rewardTypeNameAr: reward.rewardType?.nameAr || null,
  rewardTypeCalculationMethod:
    reward.rewardType?.calculationMethod || "مخصص",
  rewardTypeFrequency: reward.rewardType?.frequency || "حسب السجل",
  rewardTypeDescription:
    reward.rewardType?.description ||
    (!reward.rewardType
      ? "هذه المكافأة لا ترتبط بنوع مكافأة محفوظ، وتم تسجيلها كسجل مخصص."
      : null),
});
