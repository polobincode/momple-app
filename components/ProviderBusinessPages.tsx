import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserState, Review } from '../types';
import { ArrowLeft, Camera, CreditCard, Megaphone, DollarSign, Star, MessageSquare, Trophy, Check, Edit2, Building2, Smartphone, Wallet } from 'lucide-react';

// --- Provider Info Edit Page ---
export const ProviderEditPage = ({ userState, onUpdate }: { userState: UserState, onUpdate: (info: any) => void }) => {
  const navigate = useNavigate();
  const [info, setInfo] = useState({
    description: userState.providerInfo?.description || '',
    phoneNumber: userState.providerInfo?.phoneNumber || '010-0000-0000',
    imageUrl: userState.providerInfo?.imageUrl || ''
  });

  const handleSave = () => {
    onUpdate(info);
    alert('업체 정보가 수정되었습니다.');
    navigate(-1);
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/my', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">업체 정보 수정</h1>
      </div>
      <div className="p-5 space-y-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative mb-2">
            <img src={info.imageUrl} alt="profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Camera className="text-white" />
            </div>
          </div>
          <span className="text-xs text-gray-500">대표 이미지 변경</span>
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">업체 한줄 소개</label>
           <input 
             value={info.description} 
             onChange={(e) => setInfo({...info, description: e.target.value})}
             className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary"
             placeholder="예: 10년 경력의 베테랑 관리사 상주"
           />
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">대표 전화번호</label>
           <input 
             value={info.phoneNumber} 
             onChange={(e) => setInfo({...info, phoneNumber: e.target.value})}
             className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary"
             placeholder="010-0000-0000"
           />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md mt-4"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

// --- Ads Management Page ---
export const ProviderAdsPage = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/my', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">광고 관리</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Current Ad Status */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="font-bold text-gray-800 text-lg">프리미엄 상단 노출</h3>
               <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">진행중 (D-12)</span>
             </div>
             <Megaphone className="text-primary" size={24} />
           </div>
           <div className="grid grid-cols-2 gap-2 text-center bg-gray-50 rounded-lg p-3">
             <div>
                <div className="text-xs text-gray-400">노출 수</div>
                <div className="font-bold text-gray-800">1,240</div>
             </div>
             <div className="border-l border-gray-200">
                <div className="text-xs text-gray-400">클릭 수</div>
                <div className="font-bold text-primary">86</div>
             </div>
           </div>
        </div>

        {/* New Ad Products */}
        <h3 className="font-bold text-gray-600 mt-6 mb-2 text-sm ml-1">광고 상품 신청</h3>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
           <div>
             <h4 className="font-bold text-gray-800">메인 배너 광고</h4>
             <p className="text-xs text-gray-400">홈 화면 최상단에 노출됩니다.</p>
             <p className="text-sm font-bold text-primary mt-1">50,000 P / 1주</p>
           </div>
           <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">신청</button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
           <div>
             <h4 className="font-bold text-gray-800">검색 리스트 강조</h4>
             <p className="text-xs text-gray-400">검색 결과에 배경색이 적용됩니다.</p>
             <p className="text-sm font-bold text-primary mt-1">10,000 P / 1주</p>
           </div>
           <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">신청</button>
        </div>
      </div>
    </div>
  );
};

// --- Review Management Page ---
export const ProviderReviewsPage = ({ reviews, onUpdateReview }: { reviews: Review[], onUpdateReview: (reviewId: string, updates: Partial<Review>) => void }) => {
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [editingReply, setEditingReply] = useState<string | null>(null);

  const toggleBest = (review: Review) => {
    onUpdateReview(review.id, { isBest: !review.isBest });
  };

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;
    
    onUpdateReview(reviewId, {
      reply: {
        content: replyText[reviewId],
        date: new Date().toISOString().split('T')[0]
      }
    });
    setEditingReply(null);
  };
  
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/my', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">후기 관리</h1>
      </div>

      <div className="p-4 space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">아직 등록된 후기가 없습니다.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{review.userName}</span>
                    <span className="text-xs text-gray-400">{review.date}</span>
                 </div>
                 <button 
                   onClick={() => toggleBest(review)}
                   className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border transition-colors ${review.isBest ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                 >
                   <Trophy size={12} fill={review.isBest ? "currentColor" : "none"} />
                   {review.isBest ? '베스트' : '베스트 지정'}
                 </button>
              </div>

              <div className="flex text-yellow-400 mb-2">
                 {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                 ))}
              </div>

              <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{review.content}</p>

              {/* Reply Section */}
              <div className="bg-gray-50 rounded-lg p-3">
                {review.reply && editingReply !== review.id ? (
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">사장님 답글</span>
                      <span className="text-xs text-gray-400">{review.reply.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.reply.content}</p>
                    <button 
                      onClick={() => {
                        setEditingReply(review.id);
                        setReplyText(prev => ({ ...prev, [review.id]: review.reply!.content }));
                      }}
                      className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="답글을 입력하여 고객님께 감사를 표해보세요."
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      value={replyText[review.id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(review.id)}
                    />
                    <button 
                      onClick={() => handleReplySubmit(review.id)}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                      등록
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Points Charge Page ---
export const ProviderPointsPage = ({ currentPoints, onCharge }: { currentPoints: number, onCharge: (amount: number) => void }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'kakaopay' | 'naverpay' | 'card' | 'deposit'>('kakaopay');

  const packages = [
    { amount: 10000, bonus: 0 },
    { amount: 30000, bonus: 1000 },
    { amount: 50000, bonus: 3000 },
    { amount: 100000, bonus: 10000 },
  ];

  const handleCharge = () => {
    if (!selected) return;
    
    const methodNames = {
      kakaopay: '카카오페이',
      naverpay: '네이버페이',
      card: '신용/체크카드',
      deposit: '무통장입금'
    };

    alert(`${methodNames[paymentMethod]}로 ${selected.toLocaleString()}원 결제가 완료되었습니다.\n${selected.toLocaleString()} 포인트가 충전되었습니다.`);
    onCharge(selected);
    navigate(-1);
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/my', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">포인트 충전</h1>
      </div>

      <div className="p-4">
        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-primary/30 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-100 text-sm mb-1">현재 보유 포인트</p>
            <h2 className="text-3xl font-bold">{currentPoints.toLocaleString()} P</h2>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-white opacity-20 w-32 h-32" />
        </div>

        <h3 className="font-bold text-gray-800 mb-3 text-sm ml-1">충전 금액 선택</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {packages.map((pkg) => (
            <button
              key={pkg.amount}
              onClick={() => setSelected(pkg.amount)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center bg-white ${
                selected === pkg.amount 
                  ? 'border-primary text-primary shadow-md bg-teal-50' 
                  : 'border-gray-100 text-gray-600 hover:border-gray-300'
              }`}
            >
               <span className="font-bold text-lg">{pkg.amount.toLocaleString()}원</span>
               {pkg.bonus > 0 && <span className="text-xs text-accent mt-1">+{pkg.bonus.toLocaleString()}P 보너스</span>}
            </button>
          ))}
        </div>
        
        {selected && (
          <div className="mb-8 animate-fade-in-up">
            <h3 className="font-bold text-gray-800 mb-3 text-sm ml-1">결제 수단 선택</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod('kakaopay')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'kakaopay' ? 'bg-[#FEE500] border-[#FEE500] ring-2 ring-[#FEE500]/30 z-10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'kakaopay' ? 'bg-black/10 text-gray-800' : 'bg-gray-100 text-gray-400'}`}>
                   <MessageSquare size={16} fill="currentColor" />
                </div>
                <span className={`text-sm font-bold ${paymentMethod === 'kakaopay' ? 'text-gray-900' : 'text-gray-600'}`}>카카오페이</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('naverpay')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'naverpay' ? 'bg-[#03C75A] border-[#03C75A] ring-2 ring-[#03C75A]/30 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'naverpay' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                   <span className="font-black text-xs">N</span>
                </div>
                <span className={`text-sm font-bold ${paymentMethod === 'naverpay' ? 'text-white' : 'text-gray-600'}`}>네이버페이</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'card' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                   <CreditCard size={16} />
                </div>
                <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-blue-700' : 'text-gray-600'}`}>신용/체크카드</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('deposit')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'deposit' ? 'bg-gray-100 border-gray-300 ring-2 ring-gray-200 text-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'deposit' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                   <Building2 size={16} />
                </div>
                <span className={`text-sm font-bold ${paymentMethod === 'deposit' ? 'text-gray-900' : 'text-gray-600'}`}>무통장입금</span>
              </button>
            </div>
          </div>
        )}

        <button 
          disabled={!selected}
          onClick={handleCharge}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 ${
            selected 
            ? 'bg-gray-900 text-white hover:bg-black' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {paymentMethod === 'deposit' ? <Wallet size={20} /> : <CreditCard size={20} />}
          {selected ? `${selected.toLocaleString()}원 결제하기` : '금액을 선택해주세요'}
        </button>
      </div>
    </div>
  );
};