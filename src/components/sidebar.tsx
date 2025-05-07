import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useDocStore } from '../hooks/use-doc-store';
import { useHistory } from '../hooks/use-history';

export const Sidebar = () => {
  const { metadata, setTheme } = useDocStore();
  const { history } = useHistory();

  const themes = [
    { color: '#ffffff', class: 'bg-gray-200' },
    { color: '#3b82f6', class: 'bg-blue-500' },
    { color: '#22c55e', class: 'bg-green-500' },
    { color: '#eab308', class: 'bg-yellow-500' },
    { color: '#ef4444', class: 'bg-red-500' },
    { color: '#a855f7', class: 'bg-purple-500' },
    { color: '#ec4899', class: 'bg-pink-500' },
  ];

  const recentChanges = history.slice(0, 3);

  return (
    <div className="w-[300px] border-l border-gray-200 bg-white p-6 h-[calc(100vh-73px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Edit Doc</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <Info className="w-5 h-5" />
        </button>
      </div>
      
      {/* Classification */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">Classification</label>
        <div className="relative">
          <select className="w-full p-2 border border-gray-200 rounded-md appearance-none bg-white">
            <option>Type</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Urgency Level */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">Urgency Level</label>
        <div className="relative">
          <select className="w-full p-2 border border-gray-200 rounded-md appearance-none bg-white">
            <option>Level</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Recent Changes */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">Recent Changes</label>
        <div className="space-y-2 mt-2">
          {recentChanges.map((entry) => (
            <div key={entry.id} className="p-2 bg-gray-50 rounded-md text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{entry.user}</span>
                <span className="text-xs text-gray-500">{entry.timestamp}</span>
              </div>
              <p className="text-gray-600 mt-1">{entry.action}</p>
              {entry.content && (
                <p className="text-gray-500 text-xs mt-1 truncate">{entry.content}</p>
              )}
            </div>
          ))}
          {recentChanges.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No recent changes
            </div>
          )}
        </div>
      </div>

      {/* Doc Theme */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">Doc Theme</label>
        <div className="flex gap-2">
          {themes.map(theme => (
            <button
              key={theme.color}
              onClick={() => setTheme(theme.color)}
              className={`w-6 h-6 rounded-full ${theme.class} ${
                metadata.theme === theme.color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="space-y-2">
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
};