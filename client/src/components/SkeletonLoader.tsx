import React from 'react';

export const StockCardSkeleton: React.FC = () => (
  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="w-20 h-5 bg-gray-800 rounded-md mb-2" />
        <div className="w-32 h-3 bg-gray-800/60 rounded-md" />
      </div>
      <div className="w-16 h-4 bg-gray-800 rounded-full" />
    </div>
    <div className="flex justify-between items-end pt-3 border-t border-gray-800/40">
      <div>
        <div className="w-12 h-3 bg-gray-800/60 rounded-md mb-1" />
        <div className="w-24 h-6 bg-gray-800 rounded-md" />
      </div>
      <div className="w-16 h-6 bg-gray-800 rounded-lg" />
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 animate-pulse space-y-3">
    <div className="w-48 h-5 bg-gray-800 rounded-md mb-4" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800/40">
        <div className="w-32 h-4 bg-gray-800 rounded-md" />
        <div className="w-20 h-4 bg-gray-800 rounded-md" />
        <div className="w-16 h-4 bg-gray-800 rounded-md" />
      </div>
    ))}
  </div>
);
