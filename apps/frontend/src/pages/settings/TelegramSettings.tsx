import React from "react";
import {
  useTelegramSettingsController,
  TelegramSettingsHeader,
  TelegramBotsTab,
  TelegramUserbotsTab,
} from "./telegram-settings";

const TelegramSettings: React.FC = () => {
  const {
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
    handleStartConnection,
    handleAskReconnect,
    handleVerifyCode,
    handleDeleteUserbot,
    handleConnect,
    handleDisconnect,
    handleToggleInbox,
    resetForm,
  } = useTelegramSettingsController();

  if (isChecking) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Telegram Status...</div>;
  }

  return (
    <div
      className={`p-6 w-full ${
        derivedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <TelegramSettingsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botsCount={bots.length}
        userbotsCount={userbots.length}
        derivedTheme={derivedTheme}
      />

      <div className="mt-6">
        {activeTab === "bots" && (
          <TelegramBotsTab
            bots={bots}
            isLoading={isLoading}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            newBotLabel={newBotLabel}
            setNewBotLabel={setNewBotLabel}
            newBotToken={newBotToken}
            setNewBotToken={setNewBotToken}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            derivedTheme={derivedTheme}
          />
        )}

        {activeTab === "userbots" && (
          <TelegramUserbotsTab
            userbots={userbots}
            isLoading={isLoading}
            showAddUserbotForm={showAddUserbotForm}
            setShowAddUserbotForm={setShowAddUserbotForm}
            connectionStep={connectionStep}
            newUserbotLabel={newUserbotLabel}
            setNewUserbotLabel={setNewUserbotLabel}
            newUserbotApiId={newUserbotApiId}
            setNewUserbotApiId={setNewUserbotApiId}
            newUserbotApiHash={newUserbotApiHash}
            setNewUserbotApiHash={setNewUserbotApiHash}
            newUserbotPhone={newUserbotPhone}
            setNewUserbotPhone={setNewUserbotPhone}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            password={password}
            setPassword={setPassword}
            showApiHash={showApiHash}
            setShowApiHash={setShowApiHash}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onStartConnection={handleStartConnection}
            onAskReconnect={handleAskReconnect}
            onVerifyCode={handleVerifyCode}
            onDeleteUserbot={handleDeleteUserbot}
            onToggleInbox={handleToggleInbox}
            onResetForm={resetForm}
            derivedTheme={derivedTheme}
          />
        )}
      </div>
    </div>
  );
};

export default TelegramSettings;
