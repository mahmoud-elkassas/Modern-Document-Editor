import React, { useRef } from "react";
import {
  Undo2Icon,
  Redo2Icon,
  PrinterIcon,
  SpellCheckIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListTodoIcon,
  RemoveFormattingIcon,
  FileText,
  Upload,
  MinusIcon,
  PlusIcon,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  FileType,
  FileTextIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  FontFamilyButton,
  HeadingLevelButton,
  TextColorButton,
  HighlightColorButton,
  LinkButton,
  ImageButton,
  AlignButton,
  ListButton,
  FontSizeButton,
  LineHeightButton,
  CommentButton,
  TableButton,
} from "./editor-buttons";
import { useEditor } from "../hooks/use-editor";
import { HeaderFooterDialog } from "./header-footer/header-footer-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useDocStore } from "../hooks/use-doc-store";
import mammoth from "mammoth";
import { WordProcessor } from "../lib/word-processor";
import { exportDocument } from "../lib/document-export";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Link,
  Table,
  Undo,
  Redo,
  FileUp,
  FileDown,
  CheckCircle2 as CheckCircleIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
}: ToolbarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm h-7 min-w-7 flex items-center justify-center rounded hover:bg-neutral-200/80",
        isActive && "bg-neutral-200/80"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = [
  "docx",
  "doc",
  "pdf",
  "txt",
  "rtf",
  "odt",
  "html",
  "md",
];

export const Toolbar = () => {
  const { editor } = useEditor();
  const {
    metadata,
    setTitle,
    setAuthor,
    setLastUpdated,
    setHeaderContent,
    setFooterContent,
    setHeaderVisible,
    setFooterVisible,
    setMetadata,
  } = useDocStore();
  const [showHeaderFooter, setShowHeaderFooter] = React.useState(false);
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importSuccess, setImportSuccess] = React.useState<string | null>(null);
  const [importProgress, setImportProgress] = React.useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  const handlePrint = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    printFrameRef.current = iframe;

    // Get the editor content
    const editorContent = document.querySelector(".editor-content");
    if (!editorContent) return;

    // Write the print document
    const printDoc = iframe.contentWindow?.document;
    if (!printDoc) return;

    // Add print styles
    printDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metadata.title}</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: 'Calibri', sans-serif;
              line-height: 1.5;
              color: #000000;
            }
            .content {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
            }
            td, th {
              border: 1px solid black;
              padding: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }
              .content {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${editorContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printDoc.close();

    // Print and cleanup
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Remove iframe after printing
    setTimeout(() => {
      if (printFrameRef.current) {
        document.body.removeChild(printFrameRef.current);
        printFrameRef.current = null;
      }
    }, 500);
  };

  const handleFileImport = async (file: File) => {
    try {
      const processor = new WordProcessor();
      const { content, metadata } = await processor.processDocument(file);

      // Update document metadata
      setMetadata({
        title: metadata.title,
        author: metadata.author,
        lastUpdated: metadata.lastUpdated,
        theme: metadata.theme,
        headerContent: metadata.headerContent,
        footerContent: metadata.footerContent,
        headerVisible: metadata.headerVisible,
        footerVisible: metadata.footerVisible,
        headerSettings: metadata.headerSettings,
        footerSettings: metadata.footerSettings,
      });

      // Set content in editor
      if (editor) {
        editor.commands.setContent(content);
      }

      // Show success message
      toast({
        title: "Document imported successfully",
        description:
          "The document has been imported with all headers and footers.",
      });
    } catch (error) {
      console.error("Error importing document:", error);
      toast({
        title: "Error importing document",
        description:
          error instanceof Error ? error.message : "Failed to import document",
        variant: "destructive",
      });
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileImport(file);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileImport(file);
      // Reset the input value to allow importing the same file again
      event.target.value = "";
    }
  };

  const handleExport = async (format: "doc" | "docx" | "pdf") => {
    if (!editor) return;

    try {
      const content = editor.getHTML();
      await exportDocument({
        metadata: {
          title: metadata.title,
          author: metadata.author,
          lastUpdated: metadata.lastUpdated,
          headerContent: metadata.headerContent,
          footerContent: metadata.footerContent,
        },
        content,
        format,
      });
    } catch (error) {
      console.error("Error exporting document:", error);
    }
  };

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: handlePrint,
      },
      {
        label: "Spell Check",
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck");
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "true" ? "false" : "true"
          );
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        isActive: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        isActive: editor?.isActive("underline"),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ];

  return (
    <>
      <nav className="bg-[#f1f4f9] px-2.5 py-0.5 justify-center rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
        {sections[0].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <FontFamilyButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <HeadingLevelButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <FontSizeButton />
        <button
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .command(({ tr }) => {
                const currentSize =
                  tr.selection.$from.node().attrs?.fontSize || "16px";
                const size = parseInt(currentSize.replace("px", ""));
                tr.setNodeAttribute(
                  tr.selection.$from.pos,
                  "fontSize",
                  `${Math.max(8, size - 1)}px`
                );
                return true;
              })
              .run()
          }
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
          title="Decrease font size"
        >
          <MinusIcon className="size-4" />
        </button>
        <button
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .command(({ tr }) => {
                const currentSize =
                  tr.selection.$from.node().attrs?.fontSize || "16px";
                const size = parseInt(currentSize.replace("px", ""));
                tr.setNodeAttribute(
                  tr.selection.$from.pos,
                  "fontSize",
                  `${Math.min(72, size + 1)}px`
                );
                return true;
              })
              .run()
          }
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
          title="Increase font size"
        >
          <PlusIcon className="size-4" />
        </button>
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <TextColorButton />
        <HighlightColorButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        {sections[1].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <LinkButton />
        <ImageButton />
        <TableButton />
        <AlignButton />
        <LineHeightButton />
        <ListButton />
        <CommentButton />
        <button
          onClick={() => setShowHeaderFooter(true)}
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
          title="Header and Footer"
        >
          <FileText className="size-4" />
        </button>
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <button
          onClick={() => setShowImportDialog(true)}
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
          title="Import File"
        >
          <Upload className="size-4" />
        </button>
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <button
          onClick={() => setShowExportDialog(true)}
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
          title="Save & Export"
        >
          <Save className="size-4" />
        </button>
        {sections[2].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
      </nav>

      <HeaderFooterDialog
        open={showHeaderFooter}
        onOpenChange={setShowHeaderFooter}
      />

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: {SUPPORTED_FILE_TYPES.join(", ")}
                <br />
                Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={SUPPORTED_FILE_TYPES.map((type) => `.${type}`).join(
                  ","
                )}
                onChange={handleFileInputChange}
              />
            </div>

            {importProgress > 0 && importProgress < 100 && (
              <div className="space-y-2">
                <Progress value={importProgress} />
                <p className="text-sm text-gray-500 text-center">
                  Importing document...
                </p>
              </div>
            )}

            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert>
                <CheckCircleIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{importSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                setImportSuccess(null);
                setImportProgress(0);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save & Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose a format to export your document
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleExport("doc");
                  setShowExportDialog(false);
                }}
              >
                <FileType className="mr-2 h-4 w-4" />
                Save as .doc
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleExport("docx");
                  setShowExportDialog(false);
                }}
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                Save as .docx
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleExport("pdf");
                  setShowExportDialog(false);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
