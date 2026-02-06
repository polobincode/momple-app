
import React from 'react';
import { Provider, QualityGrade } from '../types';
import { Star, MapPin, Circle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
  onViewReviews: (provider: Provider) => void;
  onBook: (provider: Provider) => void;
  rank?: number; // Merit Rank (1, 2, 3...)
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewReviews, onBook, rank }) => {
  
  const getQualityBadge = (grade: QualityGrade) => {
    switch(grade) {
      case QualityGrade.A: 
        return <span className="flex items-center text-[10px] font-medium text-accent bg-red-50 px-1.5 py-0.5 rounded-[4px] border border-red-100 whitespace-nowrap">🔥 정부평가 A</span>;
      case QualityGrade.B: 
        return <span className="flex items-center text-[10px] font-medium text-primary bg-teal-50 px-1.5 py-0.5 rounded-[4px] border border-teal-100 whitespace-nowrap">✨ 정부평가 B</span>;
      case QualityGrade.C: 
        return <span className="flex items-center text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-[4px] border border-gray-100 whitespace-nowrap">✔️ 정부평가 C</span>;
      default: return null;
    }
  };

  const getYearsBadge = (years: number) => {
    if (years >= 10) return <span className="flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-[4px] border border-emerald-100 whitespace-nowrap">10년+ 명문</span>;
    if (years >= 5) return <span className="flex items-center text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-[4px] border border-blue-100 whitespace-nowrap">5년+ 경력</span>;
    return <span className="flex items-center text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-[4px] border border-orange-100 whitespace-nowrap">🌱 신규</span>;
  };

  const avgRating = provider.reviews.length > 0 
    ? (provider.reviews.reduce((a, b) => a + b.rating, 0) / provider.reviews.length).toFixed(1) 
    : '0.0';

  return (
    <div 
      className={`rounded-xl p-4 mb-3 border transition-all cursor-pointer relative flex flex-col h-[155px] hover:shadow-md ${
        provider.isAd 
          ? 'bg-sky-50 border-sky-200 shadow-sm' // Ad Styling
          : 'bg-white border-gray-100 shadow-sm'
      }`}
      onClick={() => onViewReviews(provider)}
    >
      {/* Ranking Dots (Top Right) */}
      {rank === 1 && (
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white shadow-sm z-10" title="평점 1위" />
      )}
      {rank === 2 && (
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow-sm z-10" title="평점 2위" />
      )}
      {rank === 3 && (
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-700 border-2 border-white shadow-sm z-10" title="평점 3위" />
      )}

      <div className="flex gap-3">
         <div className="flex-1 min-w-0">
            {/* Header: Name, Ad, Loc */}
            <div className="flex items-center gap-1.5 mb-1 pr-6"> {/* Added pr-6 to prevent overlap with dots */}
               <span className="font-bold text-gray-800 text-[15px] truncate leading-none pt-0.5">{provider.name}</span>
               {provider.isAd && <span className="text-[9px] text-sky-600 border border-sky-200 px-1 rounded-[3px] bg-white shrink-0 font-bold leading-none py-0.5">광고</span>}
               <span className="text-[11px] text-gray-400 border-l border-gray-200 pl-1.5 shrink-0 leading-none">{provider.location}</span>
            </div>

            {/* Description */}
            <h3 className="text-[13px] text-gray-500 leading-snug line-clamp-2 min-h-[2.5em] font-light">
               {provider.description}
            </h3>
         </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-2 h-[38px] overflow-hidden content-start">
          {provider.isVerified ? (
             <span className="flex items-center text-[10px] font-medium text-sky-600 bg-white px-1.5 py-0.5 rounded-[4px] border border-sky-100 whitespace-nowrap gap-0.5">
               <ShieldCheck size={10} /> 맘플 인증
             </span>
          ) : (
             <span className="flex items-center text-[10px] font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded-[4px] border border-gray-200 whitespace-nowrap gap-0.5">
               <ShieldAlert size={10} /> 맘플 미인증
             </span>
          )}
          {getQualityBadge(provider.grade)}
          {getYearsBadge(provider.yearsActive)}
      </div>

      {/* Footer: Rating Only */}
      <div className="flex justify-end items-end mt-auto">
         <div className="flex items-center gap-1 text-[11px] text-gray-400">
             <Star size={12} className="text-yellow-400 fill-yellow-400" />
             <span className="font-bold text-gray-800 text-sm">{avgRating}</span>
             <span className="text-gray-400">({provider.reviews.length})</span>
         </div>
      </div>
    </div>
  );
};

export default ProviderCard;
