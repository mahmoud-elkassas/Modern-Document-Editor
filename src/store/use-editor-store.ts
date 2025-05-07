import { Editor } from '@tiptap/react';
import { create } from 'zustand';

interface EditorStore {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
}));

export default useEditorStore;