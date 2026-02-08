import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Provider, Review, QualityGrade } from '../types';
import { MOCK_PROVIDERS } from '../constants';
import { verifyReceipt } from '../services/geminiService';
import { ArrowLeft, Star, Image as ImageIcon, Video, Upload, CreditCard, ShieldCheck, MapPin, CheckCircle, Phone, MessageSquareText, Trophy, Siren, AlertCircle, CornerDownRight, Store, Loader2, Building2, Users, Clock } from 'lucide-react';

interface ProviderDetailPageProps {
  onWriteReview: (providerId: string, content: string, rating: number, hasMedia: boolean, isVerified: boolean) => void;
  // In a real app, this would come from a global store, but for now we might receive updated reviews or stick to static + local
  customReviews?: Review[]; 
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ onWriteReview, customReviews }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // In a real app, you would fetch from API based on ID. Here we just look up Mock.
  // Note: Since we have dynamic search results not in MOCK_PROVIDERS, this simple lookup might fail for dynamic searches.
  // For the prototype, we can pass the provider object via location state or fallback.
  // We'll fallback to a generic object if not found in MOCK_PROVIDERS.
  
  const providerInitial = MOCK_PROVIDERS.find(p => p.id === id) || {
      id: id || 'unknown',
      name: '정보를 불러오는 중...',
      location: '위치 정보 없음',
      description: '정부 등록 제공기관',
      grade: QualityGrade.Unrated,
      yearsActive: 0,
      userCount: 0,
      isVerified: false,
      isAd: false,
      reviews: [],
      imageUrl: '',
      priceStart: 0,
      phoneNumber: undefined
  };

  // If customReviews (from App state) is provided, use it, otherwise fall back to initial or local state
  const [localReviews, setLocalReviews] = useState<Review[]>(providerInitial ? providerInitial.reviews : []);
  
  // Effective reviews: prefer custom prop if available (for data persistence in prototype)
  const reviews = customReviews || localReviews;

  const [viewMode, setViewMode] = useState<'list' | 'write'>('list');
  const [writeContent, setWriteContent] = useState('');
  const [writeRating, setWriteRating] = useState(5);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const provider = { ...providerInitial, reviews };

  const formatUserCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    if (count >= 100) return `${Math.floor(count / 100) * 100}+`;
    if (count >= 10) return `${Math.floor(count / 10) * 10}+`;
    return count.toString();
  };

  // Best Reviews: Prioritize 'isBest' flag, then High Rating
  const bestReviews = provider.reviews
    .filter(r => (r.isBest || r.rating >= 5) && !r.isBlinded)
    .sort((a, b) => {
        if (a.isBest && !b.isBest) return -1;
        if (!a.isBest && b.isBest) return 1;
        return b.rating - a.rating;
    })
    .slice(0, 5);

  const handleVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setVerifying(true);
    
    try {
      // Call Gemini API to verify receipt
      const isMatch = await verifyReceipt(file, provider.name);
      
      if (isMatch) {
        setVerified(true);
        alert("영수증 인증에 성공했습니다! [실제이용자 후기 인증] 뱃지가 적용됩니다.");
      } else {
        setVerified(false);
        alert(`영수증에서 '${provider.name}' 업체명을 찾을 수 없습니다.\n선명한 영수증 사진을 다시 올려주세요.`);
      }
    } catch (error) {
      console.error(error);
      alert("이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitReview = () => {
    const newReview: Review = {
        id: `new_${Date.now()}`,
        userId: 'me',
        userName: '나',
        content: writeContent,
        rating: writeRating,
        date: '방금',
        isVerified: verified
    };
    // Update local state (if not using global)
    setLocalReviews([newReview, ...localReviews]);
    // Call parent handler
    onWriteReview(provider.id, writeContent, writeRating, true, verified);
    
    alert("후기가 등록되었습니다!");
    setViewMode('list');
    setWriteContent('');
    setVerified(false);
  };

  const handleReportReview = (reviewId: string) => {
    if(window.confirm("이 후기를 신고하시겠습니까? (비방, 욕설, 허위사실 등)")) {
        alert("신고가 접수되었습니다. 관리자 확인 후 블라인드 처리됩니다.");
        // This only updates local state if not using customReviews
        setLocalReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isBlinded: true } : r));
    }
  };

  const startChat = () => {
    navigate(`/chat/c1`); 
  };

  const handleCall = () => {
    if (provider.phoneNumber) {
        window.location.href = `tel:${provider.phoneNumber}`;
    } else {
        alert('등록된 전화번호가 없습니다.');
    }
  };

  const handleBack = () => {
    if (viewMode === 'write') {
      setViewMode('list');
    } else {
       if (window.history.state && window.history.state.idx > 0) {
          navigate(-1);
       } else {
          navigate('/search', { replace: true });
       }
    }
  };

  const getQualityBadge = (grade: QualityGrade) => {
    switch(grade) {
      case QualityGrade.A: return <span className="text-accent bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">정부평가 A등급</span>;
      case QualityGrade.B: return <span className="text-primary bg-teal-50 px-2 py-1 rounded text-xs font-bold border border-teal-100">정부평가 B등급</span>;
      case QualityGrade.C: return <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded text-xs font-bold border border-gray-100">정부평가 C등급</span>;
      default: return null;
    }
  };

  const renderReviewItem = (review: Review) => {
    if (review.isBlinded) {
        return (
            <div key={review.id} className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <AlertCircle size={16} />
                    <span className="font-bold text-sm">삭제된 후기</span>
                </div>
                <p className="text-xs text-gray-400">신고에 의해 삭제된 게시글 입니다</p>
            </div>
        );
    }

    return (
    <div key={review.id} className="p-5 border-b border-gray-100 bg-white group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 mr-2.5">
            {review.userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-gray-700">{review.userName}</p>
              {review.isVerified && (
                 <span className="flex items-center text-[10px] font-medium text-white bg-green-500 px-2 py-0.5 rounded-full shadow-sm">
                   <ShieldCheck size={10} className="mr-0.5" /> 실제이용자 인증
                 </span>
              )}
              {review.isBest && (
                  <span className="flex items-center text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200">
                    <Trophy size={9} className="mr-0.5" /> BEST
                  </span>
              )}
            </div>
            <div className="flex text-yellow-400 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">{review.date}</span>
            <button 
                onClick={() => handleReportReview(review.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Siren size={14} />
            </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3 whitespace-pre-line leading-relaxed font-light">{review.content}</p>
      
      <div className="flex gap-2 mb-3">
        {review.images?.map((img, i) => (
          <img key={i} src={img} alt="review" className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
        ))}
        {review.isVideo && (
          <div className="w-16 h-16 rounded-lg bg-gray-900 text-white flex items-center justify-center border border-gray-100">
            <Video size={20} />
          </div>
        )}
      </div>

      {/* Provider Reply */}
      {review.reply && (
          <div className="bg-gray-50 rounded-xl p-3 ml-4 mt-2 relative border border-gray-100">
              <div className="absolute top-[-10px] left-4 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 transform rotate-45 z-0"></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          <CornerDownRight size={12} className="text-gray-400" /> 사장님 답글
                      </span>
                      <span className="text-xs text-gray-400">{review.reply.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 pl-4">{review.reply.content}</p>
              </div>
          </div>
      )}
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-white pb-40 relative">
      {/* Header */}
      <div className="sticky top-0 bg-white z-[60] border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm transition-all">
        <button 
          onClick={handleBack} 
          className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 cursor-pointer relative z-50"
          type="button"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-800 truncate flex-1">
          {viewMode === 'write' ? '후기 작성' : provider.name}
        </h1>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Unverified Provider Alert (CTA) */}
          {!provider.isVerified && (
             <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-300 font-medium">사장님이신가요?</p>
                   <p className="text-sm font-bold">이 업체를 내 계정으로 등록하고 관리하세요.</p>
                </div>
                <button 
                  onClick={() => navigate('/partner-subscription')} // Redirect to partner signup/subscription
                  className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  업체 등록하기
                </button>
             </div>
          )}

          {/* Provider Info Header */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/30">
             <div className="flex gap-4 mb-4">
               {/* Changed from rounded-xl to rounded-full */}
               <div className="w-16 h-16 rounded-full border border-gray-100 bg-white shrink-0 overflow-hidden">
                 {provider.imageUrl ? (
                   <img src={provider.imageUrl} alt="logo" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-sky-100 flex items-center justify-center">
                      <Store size={28} className="text-sky-300" />
                   </div>
                 )}
               </div>
               <div>
                 <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">{provider.name}</h2>
                 <div className="flex items-center text-gray-400 text-xs mb-2">
                   <MapPin size={12} className="mr-1" /> {provider.location}
                 </div>
                 
                 <div className="flex gap-1">
                   {getQualityBadge(provider.grade)}
                 </div>
               </div>
             </div>
             
             {/* Stats Row */}
             <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-400 font-medium">누적 이용자</p>
                      <p className="text-sm font-bold text-gray-800">{formatUserCount(provider.userCount)}</p>
                   </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <Clock size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-400 font-medium">운영 기간</p>
                      <p className="text-sm font-bold text-gray-800">{provider.yearsActive === 0 ? '신규' : `${provider.yearsActive}년`}</p>
                   </div>
                </div>
             </div>

             <p className="text-sm text-gray-500 leading-relaxed mb-4 font-light">{provider.description}</p>
             
             {/* Best Reviews Section */}
             <div className="mt-4">
                <h3 className="text-xs font-bold text-gray-700 mb-2.5 flex items-center gap-1.5">
                  <Trophy size={14} className="text-yellow-400 fill-yellow-400" /> 
                  <span className="text-gray-600">업체 선정 베스트 후기</span>
                </h3>
                {bestReviews.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {bestReviews.map((review) => (
                      <div key={review.id} className="min-w-[220px] max-w-[220px] bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col relative shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {review.userName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate flex-1">{review.userName}</span>
                          <div className="flex text-yellow-400">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-bold text-gray-500 ml-0.5">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-snug bg-gray-50/50 p-2 rounded-lg border border-gray-50 h-[46px]">
                          "{review.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 bg-white border border-dashed border-gray-200 p-3 rounded-lg text-center">
                    등록된 베스트 후기가 없습니다.
                  </div>
                )}
             </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-14 z-40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">생생 후기 <span className="text-primary">{provider.reviews.length}</span></span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-700">
                    {(provider.reviews.length > 0 ? provider.reviews.reduce((a, b) => a + b.rating, 0) / provider.reviews.length : 0).toFixed(1)}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setViewMode('write')}
                className="flex items-center gap-1 bg-teal-50 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100 hover:bg-teal-100 transition-colors"
              >
                <Upload size={12} /> 후기 작성
              </button>
            </div>

            {provider.reviews.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center text-gray-300">
                <Star size={40} className="opacity-20 mb-3" />
                <p className="text-sm">아직 후기가 없어요.<br/>첫 번째 후기를 남겨주세요!</p>
              </div>
            ) : (
              <div>
                {provider.reviews.map(renderReviewItem)}
              </div>
            )}
          </div>

          {/* Fixed Bottom Contact Bar */}
          <div className="fixed bottom-16 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 flex gap-3 max-w-md mx-auto right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <button 
               onClick={handleCall}
               className="flex-1 bg-white border border-gray-200 text-gray-600 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
             >
               <Phone size={18} /> 전화
             </button>
             <button 
               onClick={startChat}
               disabled={!provider.isVerified} // Disable chat for unverified providers or handle differently
               className={`flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${
                   provider.isVerified 
                   ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20' 
                   : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
               }`}
             >
               {provider.isVerified ? (
                   <><MessageSquareText size={18} /> 상담하기</>
               ) : (
                   <><MessageSquareText size={18} /> 미가입 업체</>
               )}
             </button>
          </div>
        </>
      ) : (
        // Write Mode
        <div className="p-5 bg-white min-h-[calc(100vh-56px)] pb-20">
           {/* Same write review UI as before */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6">
            <h3 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={16} /> 이용 인증하면 신뢰도 UP!
            </h3>
            <p className="text-xs text-blue-600 leading-snug">
              영수증이나 카드 내역을 첨부하시면<br/>
              <span className="font-bold">'실제이용자 후기 인증'</span> 뱃지가 표시되어 다른 분들께 도움이 됩니다.
            </p>
          </div>

          {!verified ? (
            <div className="mb-6">
              <label className={`block w-full cursor-pointer bg-white border-2 border-dashed rounded-xl p-6 text-center transition-colors group ${verifying ? 'border-primary bg-blue-50 cursor-wait' : 'border-gray-200 hover:border-primary hover:bg-teal-50'}`}>
                 {verifying ? (
                    <div className="flex flex-col items-center">
                        <Loader2 size={32} className="text-primary animate-spin mb-2" />
                        <p className="text-sm text-primary font-bold">AI가 영수증을 분석 중입니다...</p>
                    </div>
                 ) : (
                    <>
                        <CreditCard size={32} className="mx-auto text-gray-300 mb-2 group-hover:text-primary" />
                        <p className="text-sm text-gray-600 font-medium mb-1">영수증/결제내역 인증 (선택)</p>
                        <p className="text-xs text-gray-400">터치하여 이미지 업로드</p>
                    </>
                 )}
                 <input type="file" className="hidden" onChange={handleVerify} accept="image/*" disabled={verifying} />
              </label>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={24} className="text-green-600" />
                <div>
                  <p className="text-sm font-bold text-gray-800">인증 완료</p>
                  <p className="text-xs text-gray-600">후기에 '실제이용자 후기 인증' 뱃지가 표시됩니다.</p>
                </div>
              </div>
              <button onClick={() => setVerified(false)} className="text-xs text-gray-400 underline">취소</button>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">별점 평가</label>
              <div className="flex gap-2 justify-center py-2 bg-gray-50 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setWriteRating(star)} className="transition-transform active:scale-95 p-1">
                    <Star 
                      size={36} 
                      fill={star <= writeRating ? "#FFD700" : "#E5E7EB"} 
                      className={star <= writeRating ? "text-yellow-400" : "text-gray-200"} 
                      strokeWidth={star <= writeRating ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">후기 내용</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all h-40"
                placeholder="솔직한 이용 후기를 남겨주세요."
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">사진/동영상 첨부</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button className="w-20 h-20 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0">
                  <ImageIcon size={20} />
                  <span className="text-xs mt-1 font-medium">사진</span>
                </button>
                <button className="w-20 h-20 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0">
                  <Video size={20} />
                  <span className="text-xs mt-1 font-medium">영상</span>
                </button>
              </div>
            </div>

            <div className="pt-4 pb-10">
              <button 
                onClick={handleSubmitReview}
                disabled={!writeContent.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${writeContent.trim() ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                등록 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailPage;