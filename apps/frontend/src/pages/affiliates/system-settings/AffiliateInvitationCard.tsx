import React from "react";
import { LinkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { getBaseDomain } from "../../../utils/storeUrl";
import { copyAffiliateText } from "../affiliateClipboard";

interface AffiliateInvitationCardProps {
  company: {
    slug?: string;
  } | null;
  isDark: boolean;
}

export const AffiliateInvitationCard: React.FC<AffiliateInvitationCardProps> = ({
  company,
  isDark,
}) => {
  if (!company) return null;

  const getInviteLink = () => {
    if (!company.slug) return "";
    const baseDomain = getBaseDomain();
    const protocol = window.location.protocol;
    const slug = company.slug;
    if (!baseDomain.includes("localhost")) {
      return `${protocol}//${slug}.${baseDomain}/affiliate-register`;
    }
    return `${protocol}//${baseDomain}/affiliate-register/${slug}`;
  };

  const handleCopy = async () => {
    const link = getInviteLink();
    const copied = await copyAffiliateText(link);
    if (copied) {
      tToast.success("AffiliateSystemSettings.msg_66a5");
    } else {
      toast.error("لم نتمكن من النسخ تلقائياً، انسخ الرابط يدوياً من الحقل.");
    }
  };

  return (
    <div
      className={`mb-8 p-6 rounded-lg border ${
        isDark
          ? "bg-blue-900/20 border-blue-800"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-3 flex items-center ${
          isDark ? "text-blue-300" : "text-blue-900"
        }`}
      >
        <LinkIcon className="h-6 w-6 mr-2" />
        رابط دعوة المسوقين
      </h3>

      {!company.slug ? (
        <div className="text-sm p-3 rounded bg-amber-100 text-amber-800 border border-amber-200">
          ⚠️ برجاء إعداد "رابط الشركة" (Slug) في إعدادات الشركة لتمكين رابط
          الدعوة.
        </div>
      ) : (
        <>
          <p
            className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            شارك هذا الرابط مع المسوقين ليقوموا بالتسجيل في برنامجك. عند
            التسجيل، سيتم ربطهم بشركتك تلقائياً.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={getInviteLink()}
              className={`flex-1 px-4 py-3 border rounded-lg text-sm font-mono ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-300"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-semibold"
            >
              <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
              نسخ
            </button>
          </div>
        </>
      )}
    </div>
  );
};
