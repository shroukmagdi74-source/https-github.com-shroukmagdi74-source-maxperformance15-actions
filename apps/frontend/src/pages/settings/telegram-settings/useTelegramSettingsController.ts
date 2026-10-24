import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuthSimple";
import { telegramService } from "../../../services/telegramService";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import { useTheme } from "../../../hooks/useTheme";
import type { TelegramBot, TelegramUserbot, TelegramConnectionStep, TelegramTab } from "./types";

export function useTelegramSettingsController() {
  const { user } = useAuth();
  const { derivedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TelegramTab>("bots");

  // Bots State
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBotToken, setNewBotToken] = useState("");
  const [newBotLabel, setNewBotLabel] = useState("");

  // Userbots State
  const [userbots, setUserbots] = useState<TelegramUserbot[]>([]);
  const [showAddUserbotForm, setShowAddUserbotForm] = useState(false);

  // Connection Wizard State
  const [connectionStep, setConnectionStep] = useState<TelegramConnectionStep>("INIT");
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [phoneCodeHash, setPhoneCodeHash] = useState<string | null>(null);

  // Form Fields
  const [newUserbotLabel, setNewUserbotLabel] = useState("");
  const [newUserbotApiId, setNewUserbotApiId] = useState("");
  const [newUserbotApiHash, setNewUserbotApiHash] = useState("");
  const [newUserbotPhone, setNewUserbotPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");

  const [showApiHash, setShowApiHash] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const checkStatus = async () => {
    if (!user?.companyId) return;
    try {
      setIsChecking(true);
      const data = await telegramService.getStatus(user.companyId);
      setBots(data.bots || []);
    } catch (error) {
      console.error("Failed to fetch status:", error);
      toast.error("Failed to load bots");
    } finally {
      setIsChecking(false);
    }
  };

  const loadUserbots = async () => {
    if (!user?.companyId) return;
    try {
      const response = await apiClient.get("/telegram/userbots");
      setUserbots(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to load userbots:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load userbots");
      }
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      checkStatus();
      loadUserbots();
    }
  }, [user?.companyId]);

  const resetForm = () => {
    setNewUserbotLabel("");
    setNewUserbotApiId("");
    setNewUserbotApiHash("");
    setNewUserbotPhone("");
    setVerificationCode("");
    setPassword("");
    setConnectionStep("INIT");
    setCurrentConfigId(null);
    setShowAddUserbotForm(false);
  };

  const handleStartConnection = async () => {
    if (!user?.companyId) return;

    if (connectionStep === "INIT") {
      if (!newUserbotApiId || !newUserbotApiHash || !newUserbotPhone) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (connectionStep === "RECONNECT_PHONE") {
      if (!newUserbotPhone) {
        toast.error("Please enter phone number");
        return;
      }
    }

    try {
      setIsLoading(true);
      let configId = currentConfigId;

      if (connectionStep === "INIT") {
        const createResponse = await apiClient.post("/telegram/userbots", {
          label: newUserbotLabel || "Telegram Userbot",
          apiId: newUserbotApiId,
          apiHash: newUserbotApiHash,
        });
        configId = createResponse.data.data.id;
        setCurrentConfigId(configId);
      }

      if (!configId) {
        throw new Error("Configuration ID missing");
      }

      const loginResponse = await apiClient.post("/telegram/userbot/send-code", {
        userbotConfigId: configId,
        phoneNumber: newUserbotPhone,
      });

      if (loginResponse.data.success) {
        toast.success("Code sent to your Telegram account!");
        setPhoneCodeHash(loginResponse.data.phoneCodeHash);
        setConnectionStep("OTP");
      } else {
        toast.error("Failed to send code: " + loginResponse.data.error);
      }
    } catch (error: any) {
      toast.error("Connection failed: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskReconnect = (userbot: TelegramUserbot) => {
    setCurrentConfigId(userbot.id);
    setNewUserbotPhone(userbot.clientPhone || "");
    setNewUserbotLabel(userbot.label || "");
    setConnectionStep("RECONNECT_PHONE");
    setShowAddUserbotForm(true);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !currentConfigId) return;

    try {
      setIsLoading(true);

      const verifyResponse = await apiClient.post("/telegram/userbot/login", {
        userbotConfigId: currentConfigId,
        code: verificationCode,
        password: password,
      });

      if (verifyResponse.data.success) {
        toast.success("Userbot Connected Successfully!");
        loadUserbots();
        resetForm();
      } else {
        if (verifyResponse.data.requiresPassword) {
          toast.error("Two-Step Verification Required");
          setConnectionStep("2FA");
        } else {
          toast.error("Verification failed: " + verifyResponse.data.error);
        }
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.requiresPassword || errorData?.error?.includes("PASSWORD_REQUIRED")) {
        toast.error("Two-Step Verification Required");
        setConnectionStep("2FA");
      } else {
        toast.error("Verification failed: " + (errorData?.error || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUserbot = async (userbotId: string) => {
    if (!window.confirm("Are you sure you want to delete this userbot?")) return;
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/telegram/userbots/${userbotId}`);
      toast.success("Userbot deleted");
      loadUserbots();
    } catch (error: any) {
      toast.error("Failed to delete userbot: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!newBotToken) {
      toast.error("Please enter a Bot Token");
      return;
    }

    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      await telegramService.connectBot(user.companyId, newBotToken, newBotLabel);
      toast.success("Telegram Bot Connected Successfully!");
      setNewBotToken("");
      setNewBotLabel("");
      setShowAddForm(false);
      checkStatus();
    } catch (error: any) {
      toast.error("Connection Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (configId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this bot?")) return;
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      await telegramService.disconnectBot(user.companyId, configId);
      toast.success("Bot Disconnected");
      checkStatus();
    } catch (error: any) {
      toast.error("Disconnect Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleInbox = async (userbot: TelegramUserbot) => {
    try {
      await apiClient.put(`/telegram/userbots/${userbot.id}/inbox`, {
        enabled: !userbot.inboxEnabled,
      });
      loadUserbots();
      toast.success(
        userbot.inboxEnabled ? "Inbox integration disabled" : "Inbox integration enabled"
      );
    } catch {
      toast.error("Failed to toggle inbox");
    }
  };

  return {
    derivedTheme,
    activeTab,
    setActiveTab,
    bots,
    isLoading,
    isChecking,
    showAddForm,
    setShowAddForm,
    newBotToken,
    setNewBotToken,
    newBotLabel,
    setNewBotLabel,
    userbots,
    showAddUserbotForm,
    setShowAddUserbotForm,
    connectionStep,
    newUserbotLabel,
    setNewUserbotLabel,
    newUserbotApiId,
    setNewUserbotApiId,
    newUserbotApiHash,
    setNewUserbotApiHash,
    newUserbotPhone,
    setNewUserbotPhone,
    verificationCode,
    setVerificationCode,
    password,
    setPassword,
    showApiHash,
    setShowApiHash,
    showPassword,
    setShowPassword,
    phoneCodeHash,
    handleStartConnection,
    handleAskReconnect,
    handleVerifyCode,
    handleDeleteUserbot,
    handleConnect,
    handleDisconnect,
    handleToggleInbox,
    resetForm,
  };
}