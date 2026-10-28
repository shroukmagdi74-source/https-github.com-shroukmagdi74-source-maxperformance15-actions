const fs = require("fs");

describe("facebookAppConfig", () => {
  let facebookAppConfig;

  beforeEach(() => {
    jest.resetModules();
    facebookAppConfig = require("../../config/facebookAppConfig");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns empty credentials when configuration file does not exist", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(false);

    const config = facebookAppConfig.getFacebookOAuthConfig();

    expect(config.appId).toBe("");
    expect(config.appSecret).toBe("");
  });

  it("uses real credentials from the configuration file when they are valid", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        appId: "1234567890",
        appSecret: "real-secret",
        redirectUri: "https://example.com/callback",
      })
    );

    const config = facebookAppConfig.getFacebookOAuthConfig();

    expect(config.appId).toBe("1234567890");
    expect(config.appSecret).toBe("real-secret");
    expect(config.redirectUri).toBe("https://example.com/callback");
  });

  it("ignores placeholder credential values in the configuration file", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        appId: "your-facebook-app-id",
        appSecret: "your-facebook-app-secret",
      })
    );

    const config = facebookAppConfig.getFacebookOAuthConfig();

    expect(config.appId).toBe("");
    expect(config.appSecret).toBe("");
  });

  it("detects common placeholder credential values", () => {
    expect(
      facebookAppConfig.isPlaceholderFacebookCredential(
        "your-facebook-app-id",
      ),
    ).toBe(true);
    expect(
      facebookAppConfig.isPlaceholderFacebookCredential("configured"),
    ).toBe(true);
    expect(
      facebookAppConfig.isPlaceholderFacebookCredential("1234567890"),
    ).toBe(false);
  });

  describe("getFacebookAppKeyConfig", () => {
    it("falls back to primary when growth app id is not configured or placeholder", () => {
      delete process.env.FACEBOOK_GROWTH_APP_ID;
      delete process.env.FACEBOOK_GROWTH_APP_SECRET;

      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({
          appId: "primary-app-id-123",
          appSecret: "primary-secret-456",
        })
      );

      const primaryConfig = facebookAppConfig.getFacebookAppKeyConfig("primary");
      const fallbackConfig = facebookAppConfig.getFacebookAppKeyConfig("growth");

      expect(primaryConfig.appId).toBe("primary-app-id-123");
      expect(fallbackConfig.appId).toBe("primary-app-id-123");
      expect(fallbackConfig.appSecret).toBe("primary-secret-456");
    });

    it("returns growth credentials when FACEBOOK_GROWTH_APP_ID is configured", () => {
      process.env.FACEBOOK_GROWTH_APP_ID = "growth-app-id-999";
      process.env.FACEBOOK_GROWTH_APP_SECRET = "growth-secret-888";
      process.env.FACEBOOK_GROWTH_LOGIN_CONFIG_ID = "growth-login-cfg";

      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({
          appId: "primary-app-id-123",
          appSecret: "primary-secret-456",
        })
      );

      const growthConfig = facebookAppConfig.getFacebookAppKeyConfig("growth");

      expect(growthConfig.appId).toBe("growth-app-id-999");
      expect(growthConfig.appSecret).toBe("growth-secret-888");
      expect(growthConfig.loginConfigId).toBe("growth-login-cfg");

      // Verify primary is still unaffected
      const primaryConfig = facebookAppConfig.getFacebookAppKeyConfig("primary");
      expect(primaryConfig.appId).toBe("primary-app-id-123");

      delete process.env.FACEBOOK_GROWTH_APP_ID;
      delete process.env.FACEBOOK_GROWTH_APP_SECRET;
      delete process.env.FACEBOOK_GROWTH_LOGIN_CONFIG_ID;
    });
  });
});
