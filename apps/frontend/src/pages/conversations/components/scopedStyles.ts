// Scoped styles and animations for Conversations module

const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out forwards;
  }

  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
  }

  .conversation-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .conversation-item:hover {
    transform: translateY(-2px);
  }

  .message-bubble {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .message-bubble:hover {
    transform: scale(1.02);
  }

  /* Custom Scrollbar للمحادثات */
  .conversations-scroll {
    scrollbar-width: auto;
  }

  .conversations-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .conversations-scroll::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 4px;
  }

  .conversations-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .conversations-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #4f46e5, #7c3aed);
  }

  /* Custom Scrollbar للرسائل */
  .messages-scroll {
    scrollbar-width: auto;
  }

  .messages-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .messages-scroll::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.3);
    border-radius: 4px;
  }

  .messages-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #10b981, #059669);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .messages-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #047857, #065f46);
  }

  /* مؤشرات الـ Scroll */
  .scroll-indicator {
    position: relative;
  }

  .scroll-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.3), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .scroll-indicator:hover::before {
    opacity: 1;
  }
`;

let isStylesInjected = false;

export const injectConversationsStyles = (): void => {
  if (typeof document === "undefined" || isStylesInjected) return;
  const existing = document.getElementById("conversations-scoped-styles");
  if (existing) {
    isStylesInjected = true;
    return;
  }
  const styleSheet = document.createElement("style");
  styleSheet.id = "conversations-scoped-styles";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  isStylesInjected = true;
};
