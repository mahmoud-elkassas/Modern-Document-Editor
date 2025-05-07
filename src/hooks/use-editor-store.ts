import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EditorState {
  customAttribute: string;
  textContent: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

const initialState: EditorState = {
  customAttribute: '',
  textContent: '',
  textAlign: 'left',
};

const EDITOR_STATE_KEY = 'editor_state';

const getStoredState = (): EditorState => {
  const stored = localStorage.getItem(EDITOR_STATE_KEY);
  return stored ? JSON.parse(stored) : initialState;
};

const setStoredState = (state: EditorState) => {
  localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
};

export function useEditorStore() {
  const queryClient = useQueryClient();

  const { data: state = initialState } = useQuery({
    queryKey: ['editorState'],
    queryFn: getStoredState,
  });

  const updateStateMutation = useMutation({
    mutationFn: (newState: Partial<EditorState>) => {
      const updated = { ...getStoredState(), ...newState };
      setStoredState(updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editorState'] });
    },
  });

  return {
    ...state,
    setCustomAttribute: (attribute: string) => 
      updateStateMutation.mutate({ customAttribute: attribute }),
    setTextContent: (content: string) => 
      updateStateMutation.mutate({ textContent: content }),
    setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => 
      updateStateMutation.mutate({ textAlign: align }),
  };
}