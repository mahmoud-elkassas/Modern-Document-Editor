import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, type Comment } from '@/lib/comments';
import { useHistory } from './use-history';

export function useComments() {
  const queryClient = useQueryClient();
  const { addEntry } = useHistory();
  
  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: commentsApi.getComments
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: commentsApi.getUsers
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ text, highlightId }: { text: string; highlightId: string }) => 
      commentsApi.addComment(text, highlightId, 'Current User', 'current@example.com'),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      addEntry({
        type: 'comment',
        action: 'added a comment',
        user: 'Current User',
        content: newComment.text,
        commentId: newComment.id
      });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsApi.addReply(commentId, text, 'Current User', 'current@example.com'),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      addEntry({
        type: 'reply',
        action: 'replied to a comment',
        user: 'Current User',
        content: variables.text,
        commentId: variables.commentId
      });
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.toggleResolve(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: ({ commentId, replyId }: { commentId: string; replyId: string }) =>
      commentsApi.deleteReply(commentId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ to, subject, body }: { to: string; subject: string; body: string }) =>
      commentsApi.sendEmail(to, subject, body)
  });

  return {
    comments,
    users,
    addComment: (text: string, highlightId: string) => 
      addCommentMutation.mutate({ text, highlightId }),
    addReply: (commentId: string, text: string) => 
      addReplyMutation.mutate({ commentId, text }),
    resolveComment: (commentId: string) => 
      resolveCommentMutation.mutate(commentId),
    deleteComment: (commentId: string) => 
      deleteCommentMutation.mutate(commentId),
    deleteReply: (commentId: string, replyId: string) => 
      deleteReplyMutation.mutate({ commentId, replyId }),
    sendEmail: (to: string, subject: string, body: string) =>
      sendEmailMutation.mutateAsync({ to, subject, body })
  };
}