import { Editor } from '@tiptap/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHistory } from './use-history';
import { useCallback } from 'react';

const EDITOR_QUERY_KEY = ['editor'];
const EDIT_DEBOUNCE_TIME = 2000; // 2 seconds
let editTimeout: NodeJS.Timeout | null = null;
let lastContent = '';

export function useEditor() {
  const queryClient = useQueryClient();
  const { addEntry } = useHistory();

  const { data: editor } = useQuery({
    queryKey: EDITOR_QUERY_KEY,
    queryFn: () => null as Editor | null,
    initialData: null,
  });

  const handleContentChange = useCallback((updatedEditor: Editor) => {
    const selection = updatedEditor.state.selection;
    const currentContent = updatedEditor.getText();
    
    // Clear any pending timeout
    if (editTimeout) {
      clearTimeout(editTimeout);
    }

    // Only create history entry if content has changed significantly
    if (currentContent !== lastContent) {
      editTimeout = setTimeout(() => {
        const selectedText = updatedEditor.state.doc.textBetween(selection.from, selection.to);
        const contentDiff = currentContent.length - lastContent.length;
        
        // Only record if there's a significant change (more than 3 characters)
        if (Math.abs(contentDiff) > 3) {
          addEntry({
            type: 'edit',
            action: contentDiff > 0 ? 'added text' : 'removed text',
            user: 'Current User',
            content: selectedText || currentContent.slice(0, 50) + '...',
            metadata: {
              previousValue: lastContent.slice(0, 50) + '...',
              newValue: currentContent.slice(0, 50) + '...',
            }
          });
          lastContent = currentContent;
        }
      }, EDIT_DEBOUNCE_TIME);
    }
  }, [addEntry]);

  const handleFormatChange = useCallback((type: string, attrs?: Record<string, any>) => {
    const formatDescription = attrs 
      ? `${type} (${Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ')})`
      : type;

    addEntry({
      type: 'format',
      action: 'changed formatting',
      user: 'Current User',
      metadata: {
        elementType: formatDescription
      }
    });
  }, [addEntry]);

  const setEditor = (newEditor: Editor | null) => {
    if (newEditor) {
      // Initialize last content
      lastContent = newEditor.getText();
      
      // Track content changes with debounce
      newEditor.on('update', ({ editor: updatedEditor }) => {
        handleContentChange(updatedEditor);
      });

      // Track formatting changes
      newEditor.on('selectionUpdate', ({ transaction }) => {
        if (transaction.docChanged) {
          const marks = transaction.steps.filter(step => 
            step.toJSON().stepType === 'addMark' || 
            step.toJSON().stepType === 'removeMark'
          );
          
          if (marks.length > 0) {
            handleFormatChange('text style');
          }
        }
      });

      // Track specific node changes
      newEditor.on('transaction', ({ transaction }) => {
        if (transaction.docChanged) {
          // Track table operations
          if (transaction.steps.some(step => 
            step.toJSON().stepType === 'replaceAround' && 
            step.toJSON().slice?.content?.[0]?.type === 'table'
          )) {
            handleFormatChange('table');
          }

          // Track image operations
          if (transaction.steps.some(step => 
            step.toJSON().stepType === 'replaceStep' && 
            step.toJSON().slice?.content?.[0]?.type === 'image'
          )) {
            handleFormatChange('image');
          }

          // Track link operations
          if (transaction.steps.some(step => 
            step.toJSON().stepType === 'addMark' && 
            step.toJSON().mark?.type === 'link'
          )) {
            handleFormatChange('link', { href: transaction.steps[0].toJSON().mark.attrs.href });
          }
        }
      });
    }
    
    queryClient.setQueryData(EDITOR_QUERY_KEY, newEditor);
  };

  return { editor, setEditor };
}