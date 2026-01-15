
import React from 'react';

// Basic Pulse Block
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-stone-200 dark:bg-stone-800 rounded-xl ${className}`}></div>
);

// Event Card Skeleton
export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 h-full flex flex-col">
    <div className="flex justify-between items-start mb-6">
       <SkeletonBlock className="w-14 h-14 rounded-2xl" />
       <SkeletonBlock className="w-20 h-6 rounded-full" />
    </div>
    <SkeletonBlock className="w-3/4 h-8 mb-4" />
    <div className="space-y-3 mb-6 flex-grow">
       <SkeletonBlock className="w-full h-4" />
       <SkeletonBlock className="w-2/3 h-4" />
    </div>
    <SkeletonBlock className="w-full h-10 mt-auto" />
  </div>
);

// Media/Grid Item Skeleton
export const MediaCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 rounded-[2rem] overflow-hidden border border-stone-100 dark:border-stone-800">
     <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800 animate-pulse relative">
        <div className="absolute top-4 right-4 w-16 h-6 bg-stone-300 dark:bg-stone-700 rounded-full"></div>
     </div>
     <div className="p-4 space-y-3">
        <SkeletonBlock className="w-3/4 h-6" />
        <div className="flex justify-between">
           <SkeletonBlock className="w-1/3 h-4" />
           <SkeletonBlock className="w-1/4 h-4" />
        </div>
     </div>
  </div>
);

// Blog Card Skeleton
export const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden h-full flex flex-col">
     <div className="h-60 bg-stone-200 dark:bg-stone-800 animate-pulse relative"></div>
     <div className="p-8 flex-1 flex flex-col space-y-4">
        <SkeletonBlock className="w-1/3 h-4" />
        <SkeletonBlock className="w-full h-8" />
        <SkeletonBlock className="w-full h-16" />
        <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between">
           <SkeletonBlock className="w-24 h-4" />
           <SkeletonBlock className="w-16 h-4" />
        </div>
     </div>
  </div>
);

// Dashboard Stats Skeleton
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
     <div className="flex justify-between items-start mb-4">
        <SkeletonBlock className="w-12 h-12 rounded-xl" />
        <SkeletonBlock className="w-16 h-6 rounded-lg" />
     </div>
     <SkeletonBlock className="w-1/2 h-10 mb-2" />
     <SkeletonBlock className="w-1/3 h-4" />
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-4 px-6 border-b border-stone-100 dark:border-stone-800 animate-pulse">
     <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
     <div className="flex-1 space-y-2">
        <div className="w-1/3 h-4 bg-stone-200 dark:bg-stone-800 rounded"></div>
        <div className="w-1/4 h-3 bg-stone-200 dark:bg-stone-800 rounded"></div>
     </div>
     <div className="w-20 h-8 bg-stone-200 dark:bg-stone-800 rounded-lg"></div>
  </div>
);
