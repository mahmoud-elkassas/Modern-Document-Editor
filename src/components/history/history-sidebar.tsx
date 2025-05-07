import React, { useState } from 'react';
import { History, X, MessageSquare, Edit2, CornerDownRight, Trash2, Clock, Download, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useHistory } from '@/hooks/use-history';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { HistoryFilters } from './history-filters';
import type { HistoryEntry } from '@/lib/history';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar = ({ isOpen, onClose }: HistorySidebarProps) => {
  const { history, clearHistory, filterHistory, exportHistory } = useHistory();
  const [showFilters, setShowFilters] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  if (!isOpen) return null;

  const displayHistory = isFiltering ? filteredHistory : history;

  const handleExport = async () => {
    try {
      const historyData = await exportHistory();
      const blob = new Blob([historyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document-history.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      setClearingHistory(true);
      await clearHistory();
      setShowClearConfirm(false);
      setIsFiltering(false);
      setFilteredHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleFilter = async (filters: Parameters<typeof filterHistory>[0]) => {
    try {
      const filtered = await filterHistory(filters);
      setFilteredHistory(filtered);
      setIsFiltering(true);
    } catch (error) {
      console.error('Failed to filter history:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit2 className="w-4 h-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'reply':
        return <CornerDownRight className="w-4 h-4 text-green-500" />;
      case 'format':
        return <Edit2 className="w-4 h-4 text-orange-500" />;
      case 'image':
        return <Edit2 className="w-4 h-4 text-pink-500" />;
      case 'table':
        return <Edit2 className="w-4 h-4 text-indigo-500" />;
      case 'link':
        return <Edit2 className="w-4 h-4 text-teal-500" />;
      default:
        return null;
    }
  };

  const getActionDescription = (entry: HistoryEntry) => {
    let description = entry.action;
    
    if (entry.metadata?.previousValue && entry.metadata?.newValue) {
      description += `: changed from "${entry.metadata.previousValue}" to "${entry.metadata.newValue}"`;
    }
    
    if (entry.metadata?.elementType) {
      description += ` in ${entry.metadata.elementType}`;
    }
    
    return description;
  };

  // Group history entries by date
  const groupedHistory = displayHistory.reduce((groups, entry) => {
    const date = new Date(entry.timestamp);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, typeof displayHistory>);

  return (
    <div className="w-[350px] border-l border-gray-200 bg-white h-[calc(100vh-73px)] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="font-semibold">Document History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={history.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedHistory).length > 0 ? (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedHistory).map(([dateKey, entries]) => (
              <div key={dateKey} className="bg-white">
                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {isToday(new Date(dateKey))
                      ? 'Today'
                      : isYesterday(new Date(dateKey))
                      ? 'Yesterday'
                      : format(new Date(dateKey), 'MMMM d, yyyy')}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getIcon(entry.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-medium text-gray-900">{entry.user}</span>
                            <span className="text-sm text-gray-600">
                              {getActionDescription(entry)}
                            </span>
                          </div>
                          {entry.content && (
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {entry.content}
                            </p>
                          )}
                          <span className="text-xs text-gray-500 mt-1 block">
                            {format(new Date(entry.timestamp), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <History className="w-12 h-12 mb-3 opacity-50" />
            <p>No history yet</p>
            <p className="text-sm mt-1">Changes will appear here</p>
          </div>
        )}
      </div>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter History</DialogTitle>
          </DialogHeader>
          <HistoryFilters
            onFilter={handleFilter}
            onReset={() => {
              setIsFiltering(false);
              setFilteredHistory([]);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Clear History</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Are you sure you want to clear all history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              disabled={clearingHistory}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={clearingHistory}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {clearingHistory ? 'Clearing...' : 'Clear History'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};