import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { FilterState } from '@/components/facebook-inbox/FilterPanel/FilterPanel';
import type {
  InboxConversation,
  InboxMessage,
  InboxTab,
} from '@/types/inbox.types';
import { applyClientSideFilters } from './inboxClientFilters';

interface UseFacebookInboxSearchParams {
  conversations: InboxConversation[];
  selectedConversation?: InboxConversation | null;
  messages?: InboxMessage[];
  filters: FilterState;
  activeTab: InboxTab;
  userId?: string;
}

export function useFacebookInboxSearch({
  conversations,
  filters,
  activeTab,
  userId,
}: UseFacebookInboxSearchParams) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredConversations = useMemo(() => {
    return applyClientSideFilters(conversations, {
      filters,
      activeTab,
      userId,
    });
  }, [conversations, filters, activeTab, userId]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filteredConversations,
  };
}

export default useFacebookInboxSearch;
