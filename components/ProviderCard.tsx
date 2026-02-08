
import React from 'react';
import { Provider, QualityGrade } from '../types';
import { Star, ShieldCheck } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
  onViewReviews: (provider: Provider) => void;
  onBook: (provider: Provider) => void;
  rank?: number; // Merit Rank (1, 2, 3...)
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewReviews, onBook, rank }) => {
  
  const formatUserCount = (count: number) => {
      if (count >= 1000) return `+${(count / 1000).toFixed(1)}K`;
      if (count >= 100) return `+${Math.floor(count / 100) * 100}`;
      if (count >= 10) return `+${Math.floor(count / 10) * 10}`;
      return count.toString();
  };

  const avgRating = provider.reviews.length > 0 
    ? (provider.reviews.reduce((a, b) => a + b.rating, 0) / provider.reviews.length).toFixed(1) 
    : '0.0';

  return (
    <div 
      className={`rounded-xl p-3 mb-2 border transition-all cursor-pointer relative flex flex-col hover:shadow-md active:scale-[0.99] ${
        provider.isAd 
          ? 'bg-sky-50 border-sky-200 shadow-sm' 
          : 'bg-white border-gray-100 shadow-sm'
      }`}
      onClick={() => onViewReviews(provider)}
    >
      {/* Ranking Dots (Top Right) - Adjusted position for smaller padding */}
      {rank === 1 && (
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-white shadow-sm z-10" title="평점 1위" />
      )}
      {rank === 2 && (
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white shadow-sm z-10" title="평점 2위" />
      )}
      {rank === 3 && (
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-700 border-2 border-white shadow-sm z-10" title="평점 3위" />
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-0.5">
         <div className="flex flex-col gap-0.5 max-w-[80%]">
            <div className="flex items-center gap-1">
               <span className="font-bold text-gray-900 text-[14px] leading-tight truncate">{provider.name}</span>
               {provider.isAd && <span className="text-[9px] text-sky-600 bg-sky-100 px-1 rounded-[3px] font-bold leading-none py-0.5">광고</span>}
            </div>
            <span className="text-[11px] text-gray-400 truncate">{provider.location}</span>
         </div>
         
         {/* Rating displayed at top right */}
         <div className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-0.5 shrink-0">
             <Star size={10} className="text-yellow-400 fill-yellow-400" />
             <span className="font-bold text-gray-800 text-xs">{avgRating}</span>
             <span className="text-gray-400">({provider.reviews.length})</span>
         </div>
      </div>

      {/* Description */}
      <h3 className="text-[11px] text-gray-500 leading-snug line-clamp-1 font-light mt-0.5 mb-2">
         {provider.description}
      </h3>

      {/* Badges Row (Consistent Style - Compact) */}
      <div className="flex flex-wrap gap-1 mt-auto">
          {/* 1. Momple Partner */}
          {provider.isVerified && (
             <span className="flex items-center text-[9px] font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded-[5px] shadow-sm">
                <ShieldCheck size={10} className="mr-0.5" />맘플파트너스
             </span>
          )}

          {/* 2. Gov Grade */}
          {provider.grade !== QualityGrade.Unrated && (
             <span className={`flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-[5px] border shadow-sm ${
                 provider.grade === QualityGrade.A ? 'text-rose-600 bg-rose-50 border-rose-100' : 
                 provider.grade === QualityGrade.B ? 'text-teal-600 bg-teal-50 border-teal-100' :
                 'text-gray-500 bg-gray-50 border-gray-100'
             }`}>
                정부평가 {provider.grade}
             </span>
          )}

          {/* 3. User Count */}
          <span className="flex items-center text-[9px] font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-[5px] border border-gray-100">
             누적 이용 {formatUserCount(provider.userCount)}
          </span>

          {/* 4. Years Active */}
          <span className="flex items-center text-[9px] font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-[5px] border border-gray-100">
             업력 {provider.yearsActive === 0 ? '신규' : `${provider.yearsActive}년+`}
          </span>
      </div>

    </div>
  );
};

export default ProviderCard;
