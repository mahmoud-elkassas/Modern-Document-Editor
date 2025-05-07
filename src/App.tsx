import React, { useState } from 'react';
import { Editor } from './components/editor';
import { Toolbar } from './components/toolbar';
import { Sidebar } from './components/sidebar';
import { Header } from './components/header';
import { CommentsSidebar } from './components/comments/comments-sidebar';
import { HistorySidebar } from './components/history/history-sidebar';

function App() {
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <Header 
        onHistoryClick={() => setIsHistorySidebarOpen(true)}
        onCommentsClick={() => setIsCommentsSidebarOpen(true)}
      />
      <div className="flex">
        <div className="flex-1">
          <Toolbar />
          <Editor />
        </div>
        <div className="flex">
          <Sidebar />
          <CommentsSidebar 
            isOpen={isCommentsSidebarOpen} 
            onClose={() => setIsCommentsSidebarOpen(false)} 
          />
          <HistorySidebar
            isOpen={isHistorySidebarOpen}
            onClose={() => setIsHistorySidebarOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;