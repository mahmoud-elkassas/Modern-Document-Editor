import React, { useState } from 'react';
import { MessageSquare, Check, X, Trash2, CornerDownRight, Mail } from 'lucide-react';
import { type Comment } from '@/lib/comments';
import { useComments } from '@/hooks/use-comments';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommentThreadProps {
  comment: Comment;
}

export const CommentThread = ({ comment }: CommentThreadProps) => {
  const { addReply, resolveComment, deleteComment, deleteReply, sendEmail } = useComments();
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleAddReply = () => {
    if (replyText.trim()) {
      addReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser) return;

    setIsSending(true);
    try {
      const emailBody = `
Comment by ${comment.author}:
${comment.text}

${comment.replies.length > 0 ? '\nReplies:\n' + comment.replies.map(reply => 
  `${reply.author}: ${reply.text}`
).join('\n') : ''}
      `;

      await sendEmail(selectedUser.email, emailSubject, emailBody);
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border ${comment.resolved ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {comment.author[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author}</span>
              <span className="text-sm text-gray-500">{comment.createdAt}</span>
            </div>
            <p className="mt-1 text-gray-700">{comment.text}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmailDialog(true)}
            className="p-1.5 hover:bg-gray-100 rounded text-blue-500 transition-colors duration-200"
            title="Send via email"
          >
            <Mail size={16} />
          </button>
          <button
            onClick={() => resolveComment(comment.id)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            {comment.resolved ? <X size={16} /> : <Check size={16} />}
          </button>
          <button
            onClick={() => deleteComment(comment.id)}
            className="p-1.5 hover:bg-gray-100 rounded text-red-500 transition-colors duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3 pt-3 border-t">
              <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
                {reply.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.author}</span>
                  <span className="text-xs text-gray-500">{reply.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{reply.text}</p>
              </div>
              <button
                onClick={() => deleteReply(comment.id, reply.id)}
                className="p-1.5 hover:bg-gray-100 rounded text-red-500 transition-colors duration-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {!comment.resolved && (
        <div className="ml-11 mt-3">
          {isReplying ? (
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReplying(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddReply}
                  className="px-4 py-2"
                >
                  Reply
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsReplying(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <CornerDownRight size={14} />
              Reply
            </button>
          )}
        </div>
      )}

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Send Comment via Email</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Choose a recipient and add a subject to send this comment thread via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Recipient
              </label>
              <select
                className="w-full p-2.5 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const [name, email] = e.target.value.split('|');
                  setSelectedUser({ name, email });
                }}
                value={selectedUser ? `${selectedUser.name}|${selectedUser.email}` : ''}
              >
                <option value="">Select a user</option>
                <option value="John Doe|john@example.com">John Doe</option>
                <option value="Jane Smith|jane@example.com">Jane Smith</option>
                <option value="Bob Johnson|bob@example.com">Bob Johnson</option>
                <option value="Alice Brown|alice@example.com">Alice Brown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject
              </label>
              <Input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
                className="p-2.5"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEmailDialog(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={!selectedUser || !emailSubject || isSending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};