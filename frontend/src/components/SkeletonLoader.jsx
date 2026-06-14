import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col h-full space-y-3">
      <div className="aspect-[4/3] w-full skeleton rounded-xl"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 skeleton"></div>
        <div className="h-4 w-1/4 skeleton rounded-full"></div>
      </div>
      <div className="h-5 w-3/4 skeleton"></div>
      <div className="h-3 w-full skeleton"></div>
      <div className="h-3 w-5/6 skeleton"></div>
      
      <div className="h-12 w-full skeleton rounded-xl my-2"></div>
      
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-9 skeleton rounded-lg"></div>
        <div className="h-9 skeleton rounded-lg"></div>
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <CardSkeleton key={i} />
        ))}
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-video w-full skeleton rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square skeleton rounded-xl"></div>
            <div className="aspect-square skeleton rounded-xl"></div>
            <div className="aspect-square skeleton rounded-xl"></div>
            <div className="aspect-square skeleton rounded-xl"></div>
          </div>
        </div>
        
        {/* Right: Info */}
        <div className="space-y-6">
          <div className="h-4 w-1/4 skeleton"></div>
          <div className="h-8 w-3/4 skeleton"></div>
          <div className="h-4 w-1/3 skeleton"></div>
          <hr className="border-slate-100" />
          <div className="h-20 w-full skeleton"></div>
          <div className="h-24 w-full skeleton rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 skeleton rounded-xl"></div>
            <div className="h-12 skeleton rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="h-12 w-full skeleton rounded-xl"></div>
      <div className="h-12 w-full skeleton rounded-xl"></div>
      <div className="h-12 w-full skeleton rounded-xl"></div>
      <div className="h-12 w-full skeleton rounded-xl"></div>
    </div>
  );
};
