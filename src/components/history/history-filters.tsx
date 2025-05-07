import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HistoryEntry } from '@/lib/history';

interface HistoryFiltersProps {
  onFilter: (filters: {
    type?: HistoryEntry['type'][];
    user?: string;
    dateRange?: { from: Date; to: Date };
  }) => void;
  onReset: () => void;
}

export const HistoryFilters = ({ onFilter, onReset }: HistoryFiltersProps) => {
  const [selectedTypes, setSelectedTypes] = useState<HistoryEntry['type'][]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [user, setUser] = useState('');

  const types: HistoryEntry['type'][] = ['edit', 'comment', 'reply', 'format', 'image', 'table', 'link'];

  const handleFilter = () => {
    const filters: Parameters<typeof onFilter>[0] = {};
    
    if (selectedTypes.length > 0) {
      filters.type = selectedTypes;
    }
    if (user) {
      filters.user = user;
    }
    if (dateRange) {
      filters.dateRange = dateRange;
    }
    
    onFilter(filters);
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setDateRange(null);
    setUser('');
    onReset();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Action Types
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedTypes((prev) =>
                  prev.includes(type)
                    ? prev.filter((t) => t !== type)
                    : [...prev, type]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTypes.includes(type)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          User
        </label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Filter by user"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Date Range
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="date"
              onChange={(e) =>
                setDateRange((prev) => ({
                  from: new Date(e.target.value),
                  to: prev?.to || new Date(),
                }))
              }
              className="w-full px-3 py-2 border rounded-md pl-10"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <span>to</span>
          <div className="relative flex-1">
            <input
              type="date"
              onChange={(e) =>
                setDateRange((prev) => ({
                  from: prev?.from || new Date(),
                  to: new Date(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md pl-10"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleFilter}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};