import { nanoid } from 'nanoid';
import { format } from 'date-fns';

export interface Comment {
  id: string;
  text: string;
  author: string;
  email: string;
  createdAt: string;
  highlightId: string;
  replies: Reply[];
  resolved: boolean;
}

export interface Reply {
  id: string;
  text: string;
  author: string;
  email: string;
  createdAt: string;
}

// Simulate local storage as our "database"
const COMMENTS_KEY = 'doc_comments';

const getStoredComments = (): Comment[] => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredComments = (comments: Comment[]) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

// Dummy user data for demonstration
const users = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
  { name: 'Bob Johnson', email: 'bob@example.com' },
  { name: 'Alice Brown', email: 'alice@example.com' }
];

// API simulation functions
export const commentsApi = {
  getComments: async () => {
    return getStoredComments();
  },

  getUsers: async () => {
    return users;
  },

  addComment: async (text: string, highlightId: string, author: string, email: string): Promise<Comment> => {
    const comments = getStoredComments();
    const newComment: Comment = {
      id: nanoid(),
      text,
      author,
      email,
      createdAt: format(new Date(), 'PPpp'),
      highlightId,
      replies: [],
      resolved: false
    };
    
    setStoredComments([...comments, newComment]);
    return newComment;
  },

  addReply: async (commentId: string, text: string, author: string, email: string): Promise<Comment[]> => {
    const comments = getStoredComments();
    const updatedComments = comments.map(comment => 
      comment.id === commentId
        ? {
            ...comment,
            replies: [...comment.replies, {
              id: nanoid(),
              text,
              author,
              email,
              createdAt: format(new Date(), 'PPpp')
            }]
          }
        : comment
    );
    
    setStoredComments(updatedComments);
    return updatedComments;
  },

  toggleResolve: async (commentId: string): Promise<Comment[]> => {
    const comments = getStoredComments();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, resolved: !comment.resolved }
        : comment
    );
    
    setStoredComments(updatedComments);
    return updatedComments;
  },

  deleteComment: async (commentId: string): Promise<Comment[]> => {
    const comments = getStoredComments();
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    
    setStoredComments(updatedComments);
    return updatedComments;
  },

  deleteReply: async (commentId: string, replyId: string): Promise<Comment[]> => {
    const comments = getStoredComments();
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== replyId)
          }
        : comment
    );
    
    setStoredComments(updatedComments);
    return updatedComments;
  },

  sendEmail: async (to: string, subject: string, body: string): Promise<void> => {
    // In a real application, this would make an API call to your backend
    console.log('Sending email:', { to, subject, body });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};