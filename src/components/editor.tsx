import React, { useEffect, useRef } from "react";
import { useEditor as useTipTap, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { FontSizeExtension } from "../app/extensions/font-size";
import { LineHeightExtension } from "../app/extensions/line-height";
import { useEditor } from "../hooks/use-editor";
import { useDocStore } from "../hooks/use-doc-store";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

const WORDS_PER_PAGE = 500;

export const Editor = () => {
  const { setEditor } = useEditor();
  const { metadata } = useDocStore();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useTipTap({
    onCreate({ editor }) {
      setEditor(editor);
    },
    onDestroy() {
      setEditor(null);
    },
    onUpdate({ editor }) {
      setEditor(editor);
      updatePagination(editor);
    },
    onSelectionUpdate({ editor }) {
      setEditor(editor);
    },
    onTransaction({ editor }) {
      setEditor(editor);
    },
    onFocus({ editor }) {
      setEditor(editor);
    },
    onBlur({ editor }) {
      setEditor(editor);
    },
    onContentError({ editor }) {
      setEditor(editor);
    },
    editorProps: {
      attributes: {
        class:
          "editor-content focus:outline-none print:border-0 bg-white border border-[#e1e1e1] flex flex-col w-full max-w-[816px] min-h-[1054px] p-16 cursor-text prose prose-sm prose-headings:font-display prose-headings:leading-tight prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-p:text-base prose-p:text-gray-900 [&_table]:border-collapse [&_table_td]:border [&_table_td]:border-black [&_table_td]:p-2 [&_table_th]:border [&_table_th]:border-black [&_table_th]:p-2 [&_table]:border [&_table]:border-black [&_table]:w-full [&_img]:max-w-full hover:shadow-sm transition-shadow duration-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        style: `background-color: ${metadata.theme}; color: #000000;`,
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-semibold text-gray-900",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "mb-4 text-gray-900",
          },
        },
        text: {
          HTMLAttributes: {
            class: "text-gray-900",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5 mb-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5 mb-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "ml-4 text-gray-900",
          },
        },
      }),
      FontSizeExtension,
      TaskItem.configure({ nested: true }),
      TaskList,
      Table.configure({
        HTMLAttributes: {
          class: "border-collapse table-fixed w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-black p-2 text-gray-900",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-black p-2 bg-gray-100 text-gray-900 font-semibold",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg shadow-sm",
        },
      }),
      ImageResize,
      Underline,
      FontFamily.configure({
        types: ["textStyle"],
        defaultFontFamily: "Inter",
      }),
      TextStyle.configure({
        HTMLAttributes: {
          class: "text-gray-900",
        },
      }),
      Color.configure({
        types: ["textStyle"],
        defaultColor: "#000000",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      LineHeightExtension.configure({
        types: ["heading", "paragraph"],
        defaultLineHeight: "normal",
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: `
      <h1>Start typing your document...</h1>
      <p>The document will automatically paginate after every ${WORDS_PER_PAGE} words.</p>
     
    `,
  });

  const updatePagination = (editor: any) => {
    const text = editor.getText();
    const words = text.trim().split(/\s+/).length;
    const pages = Math.max(1, Math.ceil(words / WORDS_PER_PAGE));
    setTotalPages(pages);
  };

  const scrollToPage = (page: number) => {
    if (!editorRef.current) return;

    const pageHeight = 1054; // Height of an A4 page in pixels
    const scrollTop = (page - 1) * pageHeight;

    editorRef.current.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });

    setCurrentPage(page);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const pageHeight = 1054;
    const scrollTop = e.currentTarget.scrollTop;
    const newPage = Math.floor(scrollTop / pageHeight) + 1;

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`size-full overflow-hidden bg-[#f9fbfd] px-4 print:p-0 print:bg-white transition-all duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#f9fbfd]" : ""
      }`}
    >
      <div className="flex flex-col items-center">
        {metadata.headerContent && (
          <div className="sticky top-0 bg-white border-b z-50 mb-4 shadow-sm w-full max-w-[816px]">
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: metadata.headerContent }}
            />
          </div>
        )}

        <div className="w-full max-w-[816px] py-4 print:py-0 print:w-full relative">
          <div
            ref={editorRef}
            className={`w-full max-h-[1054px] overflow-y-auto overflow-x-hidden relative scroll-smooth ${
              isFullscreen ? "max-h-[calc(100vh-120px)]" : ""
            }`}
            onScroll={handleScroll}
          >
            <EditorContent editor={editor} />

            {/* Page Markers */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 w-full border-t border-dashed border-gray-300 pointer-events-none"
                style={{ top: `${(index + 1) * 1054}px` }}
              >
                <span className="absolute -top-3 right-[-40px] bg-white px-2 text-xs text-gray-500">
                  Page {index + 2}
                </span>
              </div>
            ))}
          </div>
        </div>

        {metadata.footerContent && (
          <div className="sticky bottom-0 bg-white border-t z-50 mt-4 shadow-sm w-full max-w-[816px]">
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: metadata.footerContent }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex items-center  gap-4">
        {/* Page Navigation */}
        <div className="flex items-center gap-4 bg-white rounded-full shadow-lg px-4 py-2">
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">Page {currentPage}</span>
          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
