
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Provider } from '../types';
import ProviderCard from './ProviderCard';
import { searchProvidersFromGov } from '../services/externalApi';
import { Search, RefreshCw, AlertTriangle, Database, CloudOff, Info } from 'lucide-react';

const ProviderSearchPage = ({ userState }: { userState: any }) => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [isMock, setIsMock] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchData('');
  }, []);

  const fetchData = async (searchQuery: string) => {
    setLoading(true);
    setStatusMsg('데이터 조회 중...');
    
    // API 호출
    const result = await searchProvidersFromGov(searchQuery);
    
    setProviders(result.data);
    setStatusMsg(result.status);
    setIsMock(result.isMock);
    setLoading(false);
  };

  const triggerSearch = () => {
    fetchData(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        triggerSearch();
    }
  };

  // --- Sorting Logic ---
  const displayList = [...providers].sort((a, b) => {
    if (a.isAd && !b.isAd) return -1;
    if (!a.isAd && b.isAd) return 1;
    // Mock sort: rating logic
    const scoreA = a.reviews.length * 0.1 + (a.grade === 'A' ? 5 : 0);
    const scoreB = b.reviews.length * 0.1 + (b.grade === 'A' ? 5 : 0);
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-white pb-20">
       <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
          <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3 gap-2">
             <input 
               type="text" 
               placeholder="지역(시/군/구) 또는 업체명 검색" 
               className="bg-transparent flex-1 outline-none text-sm"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleKeyDown}
             />
             <button 
               onClick={triggerSearch}
               className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
             >
               <Search size={20} />
             </button>
          </div>
          
          {/* Status Indicator Bar */}
          <div className={`mt-2 flex items-center justify-between text-[11px] px-2 py-1.5 rounded transition-colors ${isMock ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
             <span className="flex items-center gap-1.5 font-medium">
                {loading ? (
                    <RefreshCw size={12} className="animate-spin" />
                ) : isMock ? (
                    <Info size={12} />
                ) : (
                    <Database size={12} />
                )}
                {loading ? '공공데이터 조회 중...' : statusMsg}
             </span>
             {isMock && !loading && (
                <span className="opacity-70 text-[10px]">실제 데이터 연동 지연시 표시됨</span>
             )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 px-2">
             * 팁: '강남구', '부산' 등 지역명으로 검색하면 더 많은 산후도우미 업체를 찾을 수 있습니다.
          </p>
       </div>

       <div className="p-4">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-lg">
                {query ? `'${query}' 검색 결과` : '산후도우미 리스트'}
             </h2>
             <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">추천순</span>
          </div>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-gray-400 text-sm">데이터를 불러오고 있습니다...</p>
             </div>
          ) : displayList.length === 0 ? (
             <div className="text-center py-20 text-gray-400">
                <p>검색 결과가 없습니다.</p>
                <p className="text-xs mt-2 text-gray-300">다른 키워드로 검색해보세요.</p>
             </div>
          ) : (
             <div className="space-y-2">
                 {displayList.map((p, index) => (
                    <ProviderCard 
                        key={p.id} 
                        provider={p} 
                        onViewReviews={() => navigate(`/provider/${p.id}`)}
                        onBook={() => {}}
                        rank={index < 3 ? index + 1 : undefined} 
                      />
                 ))}
             </div>
          )}
       </div>
    </div>
  );
};

export default ProviderSearchPage;
