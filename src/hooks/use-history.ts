import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi, type HistoryEntry } from '@/lib/history';

export function useHistory() {
  const queryClient = useQueryClient();
  
  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: historyApi.getHistory
  });

  const addEntryMutation = useMutation({
    mutationFn: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => 
      historyApi.addEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: historyApi.clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const filterHistoryMutation = useMutation({
    mutationFn: historyApi.filterHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const exportHistoryMutation = useMutation({
    mutationFn: historyApi.exportHistory
  });

  return {
    history,
    addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => 
      addEntryMutation.mutate(entry),
    clearHistory: () => clearHistoryMutation.mutate(),
    filterHistory: (filters: Parameters<typeof historyApi.filterHistory>[0]) =>
      filterHistoryMutation.mutateAsync(filters),
    exportHistory: () => exportHistoryMutation.mutateAsync(),
    isLoading: addEntryMutation.isPending || clearHistoryMutation.isPending,
    isError: addEntryMutation.isError || clearHistoryMutation.isError,
    error: addEntryMutation.error || clearHistoryMutation.error
  };
}