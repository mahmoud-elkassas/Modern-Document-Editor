import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useComments } from '@/hooks/use-comments';
import { CommentThread } from './comment-thread';

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsSidebar = ({ isOpen, onClose }: CommentsSidebarProps) => {
  const { comments } = useComments();
  const activeComments = comments.filter(comment => !comment.resolved);
  const resolvedComments = comments.filter(comment => comment.resolved);

  if (!isOpen) return null;

  return (
    <div className="w-[350px] border-l border-gray-200 bg-white h-[calc(100vh-73px)] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="font-semibold">Comments</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeComments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Active</h3>
            {activeComments.map(comment => (
              <CommentThread key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {resolvedComments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Resolved</h3>
            {resolvedComments.map(comment => (
              <CommentThread key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {comments.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm mt-1">Select some text and click the comment button to start a discussion</p>
          </div>
        )}
      </div>
    </div>
  );
};