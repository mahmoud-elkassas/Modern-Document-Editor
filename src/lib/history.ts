import { nanoid } from 'nanoid';
import { format } from 'date-fns';

export interface HistoryEntry {
  id: string;
  type: 'edit' | 'comment' | 'reply' | 'format' | 'image' | 'table' | 'link';
  action: string;
  user: string;
  timestamp: string;
  content?: string;
  metadata?: {
    commentId?: string;
    replyId?: string;
    previousValue?: string;
    newValue?: string;
    elementType?: string;
    position?: { from: number; to: number };
  };
}

const HISTORY_KEY = 'doc_history';

const getStoredHistory = (): HistoryEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredHistory = (history: HistoryEntry[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const historyApi = {
  getHistory: async () => {
    return getStoredHistory();
  },

  addEntry: async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<HistoryEntry> => {
    const history = getStoredHistory();
    const newEntry: HistoryEntry = {
      id: nanoid(),
      timestamp: format(new Date(), 'PPpp'),
      ...entry
    };
    
    setStoredHistory([newEntry, ...history]);
    return newEntry;
  },

  clearHistory: async () => {
    setStoredHistory([]);
    return [];
  },

  getEntryById: async (entryId: string): Promise<HistoryEntry | undefined> => {
    const history = getStoredHistory();
    return history.find(entry => entry.id === entryId);
  },

  filterHistory: async (filters: {
    type?: HistoryEntry['type'][];
    user?: string;
    dateRange?: { from: Date; to: Date };
  }): Promise<HistoryEntry[]> => {
    const history = getStoredHistory();
    
    return history.filter(entry => {
      if (filters.type && !filters.type.includes(entry.type)) {
        return false;
      }
      if (filters.user && entry.user !== filters.user) {
        return false;
      }
      if (filters.dateRange) {
        const entryDate = new Date(entry.timestamp);
        if (entryDate < filters.dateRange.from || entryDate > filters.dateRange.to) {
          return false;
        }
      }
      return true;
    });
  },

  exportHistory: async (): Promise<string> => {
    const history = getStoredHistory();
    return JSON.stringify(history, null, 2);
  }
};