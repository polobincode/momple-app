import React, { useState } from 'react';
import { Provider, Review } from '../types';
import { X, Star, Image as ImageIcon, Video, Upload, CreditCard, ShieldCheck } from 'lucide-react';

interface ReviewModalProps {
  provider: Provider | null;
  onClose: () => void;
  onWriteReview: (content: string, rating: number, hasMedia: boolean, isVerified: boolean) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  provider, onClose, onWriteReview 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'write'>('list');
  const [writeContent, setWriteContent] = useState('');
  const [writeRating, setWriteRating] = useState(5);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!provider) return null;

  const handleVerify = () => {
    setVerifying(true);
    // Simulate OCR/API verification delay
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  const handleSubmitReview = () => {
    onWriteReview(writeContent, writeRating, true, verified); // Pass verified status
    setViewMode('list');
    setWriteContent('');
    setVerified(false);
  };

  const renderReviewItem = (review: Review) => {
    return (
      <div key={review.id} className="p-4 border-b border-gray-100 last:border-0 bg-white">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 mr-2.5">
              {review.userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-800">{review.userName}</p>
                {review.isVerified && (
                   <span className="flex items-center text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full border border-green-200">
                     <ShieldCheck size={10} className="mr-0.5" /> 실제이용인증
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
          <span className="text-xs text-gray-400">{review.date}</span>
        </div>
        <p className="text-gray-700 text-sm mb-3 whitespace-pre-line leading-relaxed">{review.content}</p>
        
        {/* Media Preview */}
        <div className="flex gap-2">
          {review.images?.map((img, i) => (
            <img key={i} src={img} alt="review" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
          ))}
          {review.isVideo && (
            <div className="w-16 h-16 rounded-lg bg-black/90 text-white flex items-center justify-center border border-gray-200">
              <Video size={20} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800 truncate pr-4">
            {viewMode === 'list' ? `${provider.name} 후기 (${provider.reviews.length})` : '후기 작성'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50">
          {viewMode === 'list' ? (
            <>
              {provider.reviews.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Star size={32} className="opacity-20 text-gray-500" />
                  </div>
                  <p className="text-sm">등록된 후기가 없습니다.<br/>첫 후기의 주인공이 되어보세요!</p>
                </div>
              ) : (
                <div className="bg-white">
                  {provider.reviews.map((review) => renderReviewItem(review))}
                  <div className="h-20"></div> {/* Spacer for floating button */}
                </div>
              )}
              
              {/* Floating Write Button - Always Visible */}
              <div className="absolute bottom-6 right-6">
                <button 
                  onClick={() => setViewMode('write')}
                  className="bg-primary hover:bg-red-500 text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95 flex items-center gap-2 group"
                >
                  <Upload size={20} className="group-hover:animate-bounce" />
                  <span className="font-bold text-sm">후기 쓰기</span>
                </button>
              </div>
            </>
          ) : (
            // Write Mode
            <div className="p-5 bg-white h-full">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h3 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={16} /> 이용 인증하면 신뢰도 UP!
                </h3>
                <p className="text-xs text-blue-600 leading-snug">
                  영수증이나 카드 내역을 첨부하시면<br/>
                  <span className="font-bold">'실제이용인증'</span> 뱃지가 표시되어 다른 분들께 도움이 됩니다.
                </p>
              </div>

              {!verified ? (
                <div className="mb-6">
                  <label className="block w-full cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-red-50 transition-colors group">
                     <CreditCard size={32} className="mx-auto text-gray-400 mb-2 group-hover:text-primary" />
                     <p className="text-sm text-gray-600 font-bold mb-1">영수증/결제내역 인증하기 (선택)</p>
                     <p className="text-xs text-gray-400">{verifying ? '인증 확인 중...' : '터치하여 이미지 업로드'}</p>
                     <input type="file" className="hidden" onChange={handleVerify} accept="image/*" />
                  </label>
                </div>
              ) : (
                <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-800">인증 완료</p>
                      <p className="text-xs text-green-600">후기에 인증 뱃지가 표시됩니다.</p>
                    </div>
                  </div>
                  <button onClick={() => setVerified(false)} className="text-xs text-gray-400 underline">취소</button>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">별점 평가</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setWriteRating(star)} className="transition-transform active:scale-95">
                        <Star 
                          size={36} 
                          fill={star <= writeRating ? "#FFD700" : "#F3F4F6"} 
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
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                    rows={6}
                    placeholder="이모님은 어떠셨나요?&#13;&#10;다른 엄마들에게 큰 도움이 되는 솔직한 후기를 남겨주세요."
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

                <div className="pt-4">
                  <button 
                    onClick={handleSubmitReview}
                    disabled={!writeContent.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${writeContent.trim() ? 'bg-primary text-white hover:bg-red-500 shadow-primary/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    등록 완료
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CheckCircle Helper
const CheckCircle: React.FC<any> = ({ size, className }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default ReviewModal;