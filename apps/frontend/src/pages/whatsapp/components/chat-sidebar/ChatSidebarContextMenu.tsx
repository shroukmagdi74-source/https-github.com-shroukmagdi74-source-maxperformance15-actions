import React from 'react';
import {
  Archive,
  ArchiveRestore,
  Ban,
  CheckCheck,
  Pin,
  Trash2,
  VolumeX,
} from 'lucide-react';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';
import type { ContextMenuState } from './types';

interface ChatSidebarContextMenuProps {
  contextMenu: ContextMenuState | null;
  onClose: () => void;
  onPinChat: (contact: Contact) => void;
  onMarkAsRead: (contact: Contact) => void;
  onMuteChat: (contact: Contact) => void;
  onArchiveChat: (contact: Contact) => void;
  onDeleteChat: (contact: Contact) => void;
  onBlockContact: (contact: Contact) => void;
  translate: (key: string) => string;
}

export const ChatSidebarContextMenu: React.FC<ChatSidebarContextMenuProps> = ({
  contextMenu,
  onClose,
  onPinChat,
  onMarkAsRead,
  onMuteChat,
  onArchiveChat,
  onDeleteChat,
  onBlockContact,
  translate,
}) => {
  if (!contextMenu) return null;

  const contact = contextMenu.contact;
  const menuLeft =
    typeof window !== 'undefined'
      ? Math.min(contextMenu.mouseX, window.innerWidth - 240)
      : 0;
  const menuTop =
    typeof window !== 'undefined'
      ? Math.min(contextMenu.mouseY, window.innerHeight - 280)
      : 0;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div
        className="fixed z-50 w-56 rounded-2xl border border-[color:var(--shell-overlay-border)] bg-[var(--shell-overlay-bg)] p-1.5 shadow-[var(--shell-overlay-shadow)] ring-1 ring-[color:var(--shell-overlay-edge)]"
        style={{ left: menuLeft, top: menuTop }}
        role="menu"
        onKeyDown={(e) => {
          const buttons = e.currentTarget.querySelectorAll('button');
          const current = document.activeElement;
          const currentIdx = Array.from(buttons).indexOf(current as HTMLButtonElement);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = buttons[currentIdx + 1] || buttons[0];
            (next as HTMLButtonElement)?.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = buttons[currentIdx - 1] || buttons[buttons.length - 1];
            (prev as HTMLButtonElement)?.focus();
          }
        }}
      >
        <button
          type="button"
          onClick={() => {
            onPinChat(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--shell-control-hover)]"
        >
          <span>
            {contact.isPinned
              ? translate('whatsapp.sidebar.unpinChat')
              : translate('whatsapp.sidebar.pinChat')}
          </span>
          <Pin className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            onMarkAsRead(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--shell-control-hover)]"
        >
          <span>
            {contact.unreadCount
              ? translate('whatsapp.sidebar.read')
              : translate('whatsapp.sidebar.unreadAction')}
          </span>
          <CheckCheck className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            onMuteChat(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--shell-control-hover)]"
        >
          <span>
            {contact.isMuted
              ? translate('whatsapp.sidebar.unmute')
              : translate('whatsapp.sidebar.mute')}
          </span>
          <VolumeX className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            onArchiveChat(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--shell-control-hover)]"
        >
          <span>
            {contact.isArchived
              ? translate('whatsapp.sidebar.unarchive')
              : translate('whatsapp.sidebar.archive')}
          </span>
          {contact.isArchived ? (
            <ArchiveRestore className="size-3.5" />
          ) : (
            <Archive className="size-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onDeleteChat(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/10"
        >
          <span>{translate('whatsapp.sidebar.deleteChat')}</span>
          <Trash2 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            onBlockContact(contact);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/10"
        >
          <span>
            {contact.isBlocked
              ? translate('whatsapp.sidebar.unblock')
              : translate('whatsapp.sidebar.block')}
          </span>
          <Ban className="size-3.5" />
        </button>
      </div>
    </>
  );
};
