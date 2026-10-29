function buildFacebookTokenUpdateData(accessToken, type = "page", appKey = "primary") {
  const resolvedKey = String(appKey || "primary").trim().toLowerCase() || "primary";
  const appFields = {
    facebookAppKey: resolvedKey,
    fbAppKey: resolvedKey,
  };

  if (type === "pixel") {
    return {
      facebookPixelAccessToken: accessToken,
      ...appFields,
    };
  }

  if (type === "ads") {
    return {
      facebookAdsAccessToken: accessToken,
      ...appFields,
    };
  }

  return {
    facebookUserAccessToken: accessToken,
    ...appFields,
  };
}

module.exports = {
  buildFacebookTokenUpdateData,
};
