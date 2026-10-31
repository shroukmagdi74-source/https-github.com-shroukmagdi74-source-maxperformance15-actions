/**
 * Token Resolution & Validation Helpers
 */
const { getSharedPrismaClient, validateFacebookPageAccessToken } = require("./dependencies");

async function getCompanyAdsAccessToken(companyId, adAccountId = null) {
  try {
    const prisma = getSharedPrismaClient();

    // 1️⃣ لو تم تمرير معرف الحساب الإعلاني، نحاول أولاً سحب التوكن المعزول الخاص به أو بمصدره
    if (adAccountId) {
      const normalizedId = String(adAccountId).trim().replace(/^act_/, "");
      const adAccount = await prisma.facebookAdAccount.findFirst({
        where: {
          companyId,
          accountId: { in: [normalizedId, `act_${normalizedId}`] },
        },
        select: {
          accessToken: true,
          connectionSource: {
            select: { accessToken: true, status: true },
          },
        },
      });

      if (adAccount?.accessToken) {
        return adAccount.accessToken;
      }
      if (
        adAccount?.connectionSource?.status === "connected" &&
        adAccount.connectionSource.accessToken
      ) {
        return adAccount.connectionSource.accessToken;
      }
    }

    // 2️⃣ أولوية لـ Ads Access Token الخاص بالشركة
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        facebookAdsAccessToken: true,
        facebookUserAccessToken: true,
      },
    });

    if (company?.facebookAdsAccessToken) {
      return company.facebookAdsAccessToken;
    }

    // 3️⃣ قراءة من أحدث مصدر معزول نشط (ConnectionSource)
    const source = await prisma.facebookAdsConnectionSource.findFirst({
      where: { companyId, status: "connected" },
      select: { accessToken: true },
      orderBy: { updatedAt: "desc" },
    });

    if (source?.accessToken) {
      return source.accessToken;
    }

    // 4️⃣ Fallback: User Access Token العام للصفحات
    return company?.facebookUserAccessToken || null;
  } catch (error) {
    console.error("❌ Error getting company access token:", error);
    return null;
  }
}

async function getCompanyFacebookTokens(companyId) {
  try {
    const company = await getSharedPrismaClient().company.findUnique({
      where: { id: companyId },
      select: {
        facebookAdsAccessToken: true,
        facebookUserAccessToken: true,
      },
    });

    return {
      adsAccessToken: company?.facebookAdsAccessToken || null,
      userAccessToken: company?.facebookUserAccessToken || null,
    };
  } catch (error) {
    console.error("❌ Error getting company Facebook tokens:", error);
    return {
      adsAccessToken: null,
      userAccessToken: null,
    };
  }
}

async function getCompanyPageAccessToken(companyId) {
  const tokens = await getCompanyFacebookTokens(companyId);
  return tokens.userAccessToken || tokens.adsAccessToken || null;
}

module.exports = {
  getCompanyAdsAccessToken,
  getCompanyFacebookTokens,
  getCompanyPageAccessToken,
};
