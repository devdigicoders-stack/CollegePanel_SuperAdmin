import React from 'react';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="w-full">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50/50 border-b border-gray-100">
          {[...Array(columns)].map((_, i) => (
            <th key={i} className="py-4 px-5">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-gray-50">
            {[...Array(columns)].map((_, colIdx) => (
              <td key={colIdx} className="py-4 px-5">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between animate-pulse min-h-[160px]">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
      <div className="w-16 h-6 rounded-full bg-gray-100"></div>
    </div>
    <div className="space-y-2 mt-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-pulse pb-10">
    <div>
      <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-64"></div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 shrink-0"></div>
        <div className="flex-1 space-y-4 py-2">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-5"></div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
