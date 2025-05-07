import React, { useState, useRef } from 'react';
import { MessageSquare, Check, X, Trash2, CornerDownRight, Mail, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, ImageIcon, Hash, Calendar, Type, Bold, Italic, Underline as UnderlineIcon, Upload, ListIcon, ListOrderedIcon, ListCollapseIcon, Table as TableIcon, Plus, Minus } from 'lucide-react';
import { type Level } from "@tiptap/extension-heading";
import { type ColorResult, SketchPicker } from "react-color";
import { nanoid } from 'nanoid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor } from '../hooks/use-editor';
import { useComments } from '../hooks/use-comments';

export const LineHeightButton = () => {
    const { editor } = useEditor();

    const lineHeights = [
        { label: "Default", value: "normal" },
        { label: "Single", value: "1" },
        { label: "1.15", value: "1.15" },
        { label: "1.5", value: "1.5" },
        { label: "Double", value: "2" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <ListCollapseIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {lineHeights.map(({ label, value }) => (
                    <button key={label} 
                        onClick={() => editor?.chain().focus().setLineHeight(value).run()}
                        className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.getAttributes("paragraph").lineHeights === value && "bg-neutral-200/80"
                        )}>
                        <span className='text-sm'>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const FontFamilyButton = () => {
    const { editor } = useEditor();

    const fonts = [
        { label: "Default", value: "Inter" },
        { label: "Arial", value: "Arial" },
        { label: "Georgia", value: "Georgia" },
        { label: "Times New Roman", value: "Times New Roman" },
        { label: "Courier New", value: "Courier New" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <span className="text-sm">Font</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {fonts.map(({ label, value }) => (
                    <button key={label} 
                        onClick={() => editor?.chain().focus().setFontFamily(value).run()}
                        className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive("textStyle", { fontFamily: value }) && "bg-neutral-200/80"
                        )}>
                        <span className='text-sm' style={{ fontFamily: value }}>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const HeadingLevelButton = () => {
    const { editor } = useEditor();

    const levels: { level: Level; label: string; }[] = [
        { level: 1, label: "Heading 1" },
        { level: 2, label: "Heading 2" },
        { level: 3, label: "Heading 3" },
        { level: 4, label: "Heading 4" },
        { level: 5, label: "Heading 5" },
        { level: 6, label: "Heading 6" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <span className="text-sm">H</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {levels.map(({ level, label }) => (
                    <button key={level} 
                        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
                        className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive("heading", { level }) && "bg-neutral-200/80"
                        )}>
                        <span className='text-sm'>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const FontSizeButton = () => {
    const { editor } = useEditor();

    const sizes = [
        { label: "Default", value: "16px" },
        { label: "Small", value: "12px" },
        { label: "Medium", value: "16px" },
        { label: "Large", value: "20px" },
        { label: "Extra Large", value: "24px" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <span className="text-sm">Size</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {sizes.map(({ label, value }) => (
                    <button key={label} 
                        onClick={() => editor?.chain().focus().setFontSize(value).run()}
                        className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive("textStyle", { fontSize: value }) && "bg-neutral-200/80"
                        )}>
                        <span className='text-sm'>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const TextColorButton = () => {
    const { editor } = useEditor();
    const [color, setColor] = useState('#000000');

    const handleColorChange = (colorResult: ColorResult) => {
        const newColor = colorResult.hex;
        setColor(newColor);
        editor?.chain().focus().setColor(newColor).run();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
                    style={{ color: editor?.getAttributes('textStyle').color || color }}
                >
                    <span className="text-sm">A</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <div className="p-2 bg-white">
                    <SketchPicker
                        color={editor?.getAttributes('textStyle').color || color}
                        onChange={handleColorChange}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const HighlightColorButton = () => {
    const { editor } = useEditor();
    const [color, setColor] = useState('#ffeb3b');

    const handleColorChange = (colorResult: ColorResult) => {
        const newColor = colorResult.hex;
        setColor(newColor);
        editor?.chain().focus().setHighlight({ color: newColor }).run();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm"
                    style={{ backgroundColor: editor?.getAttributes('highlight').color || color }}
                >
                    <span className="text-sm">H</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <div className="p-2 bg-white">
                    <SketchPicker
                        color={editor?.getAttributes('highlight').color || color}
                        onChange={handleColorChange}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const LinkButton = () => {
    const { editor } = useEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');

    const addLink = () => {
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
        setIsOpen(false);
        setUrl('');
    };

    const removeLink = () => {
        editor?.chain().focus().unsetLink().run();
        setIsOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                        <span className="text-sm">Link</span>
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Link</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Input
                            type="url"
                            placeholder="Enter URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="flex justify-between">
                            <Button onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                {editor?.isActive('link') && (
                                    <Button onClick={removeLink}>
                                        Remove Link
                                    </Button>
                                )}
                                <Button onClick={addLink}>Add Link</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const ImageButton = () => {
    const { editor } = useEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [tab, setTab] = useState<'url' | 'upload'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addImage = () => {
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
        setIsOpen(false);
        setUrl('');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                editor?.chain().focus().setImage({ src: result }).run();
                setIsOpen(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                        <ImageIcon className="size-4" />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 border-b">
                            <button
                                onClick={() => setTab('url')}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium",
                                    tab === 'url' ? "border-b-2 border-blue-500" : "text-gray-500"
                                )}
                            >
                                Image URL
                            </button>
                            <button
                                onClick={() => setTab('upload')}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium",
                                    tab === 'upload' ? "border-b-2 border-blue-500" : "text-gray-500"
                                )}
                            >
                                Upload Image
                            </button>
                        </div>

                        {tab === 'url' ? (
                            <div className="space-y-4">
                                <Input
                                    type="url"
                                    placeholder="Enter image URL"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <div className="flex justify-between">
                                    <Button onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={addImage}>Add Image</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                <div className="text-xs text-gray-500">
                                    Supported formats: PNG, JPEG, GIF, WebP
                                </div>
                                <div className="flex justify-between">
                                    <Button onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const AlignButton = () => {
    const { editor } = useEditor();

    const alignments = [
        { label: "Left", value: "left", icon: AlignLeftIcon },
        { label: "Center", value: "center", icon: AlignCenterIcon },
        { label: "Right", value: "right", icon: AlignRightIcon },
        { label: "Justify", value: "justify", icon: AlignJustifyIcon },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <AlignLeftIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {alignments.map(({ label, value, icon: Icon }) => (
                    <button key={value} 
                        onClick={() => editor?.chain().focus().setTextAlign(value).run()}
                        className={cn("flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive({ textAlign: value }) && "bg-neutral-200/80"
                        )}>
                        <Icon className="size-4" />
                        <span className='text-sm'>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const ListButton = () => {
    const { editor } = useEditor();

    const lists = [
        { label: "Bullet List", value: "bulletList", icon: ListIcon },
        { label: "Ordered List", value: "orderedList", icon: ListOrderedIcon },
    ];

    const toggleList = (type: 'bulletList' | 'orderedList') => {
        if (!editor) return;

        if (type === 'bulletList') {
            editor.chain().focus().toggleBulletList().run();
        } else {
            editor.chain().focus().toggleOrderedList().run();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <ListIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='p-0'>
               {lists.map(({ label, value, icon: Icon }) => (
                    <button key={value} 
                        onClick={() => toggleList(value as 'bulletList' | 'orderedList')}
                        className={cn(
                            "flex items-center gap-x-2 w-full px-3 py-2 text-sm hover:bg-neutral-100",
                            editor?.isActive(value) && "bg-neutral-100"
                        )}
                    >
                        <Icon className="size-4" />
                        <span>{label}</span>
                    </button>
               ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const CommentButton = () => {
    const { editor } = useEditor();
    const { addComment } = useComments();
    const [isOpen, setIsOpen] = useState(false);
    const [comment, setComment] = useState('');

    const addCommentToSelection = () => {
        if (comment && editor) {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to);
            
            if (selectedText) {
                const highlightId = nanoid();
                
                editor
                    .chain()
                    .focus()
                    .setMark('highlight', { 
                        color: '#fff68f',
                        id: highlightId 
                    })
                    .run();

                addComment(comment, highlightId);
            }
        }
        setIsOpen(false);
        setComment('');
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                        <MessageSquare className="size-4" />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Comment</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="text-sm text-gray-500">
                            Select text and add your comment
                        </div>
                        <textarea
                            className="w-full p-2 border border-gray-200 rounded-md min-h-[100px] resize-none"
                            placeholder="Enter your comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-between">
                            <Button onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={addCommentToSelection}>Add Comment</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const TableButton = () => {
    const { editor } = useEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const insertTable = () => {
        if (!editor) return;

        editor.chain().focus().insertTable({ rows, cols }).run();
        setIsOpen(false);
        setRows(3);
        setCols(3);
    };

    const addColumnBefore = () => {
        editor?.chain().focus().addColumnBefore().run();
    };

    const addColumnAfter = () => {
        editor?.chain().focus().addColumnAfter().run();
    };

    const deleteColumn = () => {
        editor?.chain().focus().deleteColumn().run();
    };

    const addRowBefore = () => {
        editor?.chain().focus().addRowBefore().run();
    };

    const addRowAfter = () => {
        editor?.chain().focus().addRowAfter().run();
    };

    const deleteRow = () => {
        editor?.chain().focus().deleteRow().run();
    };

    const deleteTable = () => {
        editor?.chain().focus().deleteTable().run();
    };

    const mergeOrSplit = () => {
        if (editor?.isActive('tableCell')) {
            if (editor.can().mergeCells()) {
                editor.chain().focus().mergeCells().run();
            } else if (editor.can().splitCell()) {
                editor.chain().focus().splitCell().run();
            }
        }
    };

    const isTableSelected = editor?.isActive('table');

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden test-sm">
                    <TableIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {!isTableSelected ? (
                    <div className="p-2">
                        <div className="mb-2">
                            <label className="text-sm font-medium">Rows</label>
                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={() => setRows(Math.max(1, rows - 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={rows}
                                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                                    className="w-20 text-center"
                                />
                                <button
                                    onClick={() => setRows(Math.min(10, rows + 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium">Columns</label>
                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={() => setCols(Math.max(1, cols - 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={cols}
                                    onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                                    className="w-20 text-center"
                                />
                                <button
                                    onClick={() => setCols(Math.min(10, cols + 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </div>
                        <Button onClick={insertTable} className="w-full">
                            Insert Table
                        </Button>
                    </div>
                ) : (
                    <div className="py-1">
                        <DropdownMenuItem onClick={addColumnBefore}>
                            Add Column Before
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={addColumnAfter}>
                            Add Column After
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteColumn}>
                            Delete Column
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={addRowBefore}>
                            Add Row Before
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={addRowAfter}>
                            Add Row After
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteRow}>
                            Delete Row
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={mergeOrSplit}>
                            Merge/Split Cells
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteTable} className="text-red-600">
                            Delete Table
                        </DropdownMenuItem>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};