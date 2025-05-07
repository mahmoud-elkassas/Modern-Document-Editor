import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ImageIcon,
  Hash,
  Calendar,
  Type,
  Bold,
  Italic,
  Underline as UnderlineIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SketchPicker } from "react-color";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HeaderFooterEditorProps {
  content: string;
  onChange: (content: string) => void;
  type: "header" | "footer";
}

export const HeaderFooterEditor = ({
  content,
  onChange,
  type,
}: HeaderFooterEditorProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-h-16",
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      Underline,
      Placeholder.configure({
        placeholder: `Enter ${type} text...`,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageDialog(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        editor.chain().focus().setImage({ src: result }).run();
        setShowImageDialog(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const insertPageNumber = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent(
          '<span class="page-number" data-page-number="true">[Page #]</span>'
        )
        .run();
    }
  };

  const insertDate = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent(
          '<span class="current-date" data-current-date="true">[Current Date]</span>'
        )
        .run();
    }
  };

  const fonts = [
    { label: "Default", value: "Inter" },
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
  ];

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-100">
              <Type className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fonts.map(({ label, value }) => (
              <DropdownMenuItem
                key={value}
                onClick={() =>
                  editor.chain().focus().setFontFamily(value).run()
                }
                className={
                  editor.isActive("textStyle", { fontFamily: value })
                    ? "bg-gray-100"
                    : ""
                }
              >
                <span style={{ fontFamily: value }}>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("bold") ? "bg-gray-100" : ""
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("italic") ? "bg-gray-100" : ""
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("underline") ? "bg-gray-100" : ""
          }`}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-100">
              <span
                className="w-4 h-4 block"
                style={{
                  backgroundColor:
                    editor.getAttributes("textStyle").color || "#000000",
                }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="p-2">
              <SketchPicker
                color={editor.getAttributes("textStyle").color}
                onChange={(color) =>
                  editor.chain().focus().setColor(color.hex).run()
                }
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-100" : ""
          }`}
        >
          <AlignLeftIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-100" : ""
          }`}
        >
          <AlignCenterIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-100" : ""
          }`}
        >
          <AlignRightIcon className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        <button
          onClick={() => setShowImageDialog(true)}
          className="p-2 rounded hover:bg-gray-100"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={insertPageNumber}
          className="p-2 rounded hover:bg-gray-100"
          title="Insert Page Number"
        >
          <Hash className="w-4 h-4" />
        </button>

        <button
          onClick={insertDate}
          className="p-2 rounded hover:bg-gray-100"
          title="Insert Current Date"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} className="prose max-w-none" />

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={imageTab === "url" ? "default" : "outline"}
                onClick={() => setImageTab("url")}
              >
                URL
              </Button>
              <Button
                variant={imageTab === "upload" ? "default" : "outline"}
                onClick={() => setImageTab("upload")}
              >
                Upload
              </Button>
            </div>
            {imageTab === "url" ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button onClick={insertImage}>Insert</Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
