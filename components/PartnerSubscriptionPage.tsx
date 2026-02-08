
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Zap, MessageSquare, Smartphone } from 'lucide-react';

interface PartnerSubscriptionPageProps {
  onSubscribe: () => void;
}

const PartnerSubscriptionPage: React.FC<PartnerSubscriptionPageProps> = ({ onSubscribe }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate Payment Process (e.g., Google Play Billing / App Store IAP)
    setTimeout(() => {
      setLoading(false);
      alert('정기 구독이 완료되었습니다.\n이제 채팅을 무제한으로 이용하실 수 있습니다!');
      onSubscribe();
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">이용권 결제</h1>
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-24">
        {/* Banner */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
           <div className="relative z-10">
             <span className="bg-[#FEE500] text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">PARTNER PRO</span>
             <h2 className="text-2xl font-bold mb-1">채팅 무제한 이용권</h2>
             <p className="text-gray-300 text-sm">고객을 놓치지 않는 가장 확실한 방법</p>
           </div>
           <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
              <MessageSquare size={140} />
           </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center mb-6">
           <p className="text-gray-500 text-sm font-medium mb-1">월 정기 구독료</p>
           <div className="flex items-end justify-center gap-1 mb-4">
              <span className="text-4xl font-bold text-gray-900">5,000</span>
              <span className="text-gray-600 mb-1">원</span>
           </div>
           <p className="text-xs text-gray-400">VAT 포함, 매월 자동 결제</p>
        </div>

        {/* Features List */}
        <h3 className="font-bold text-gray-800 mb-4 ml-1">이용권 혜택</h3>
        <div className="space-y-3">
           <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                 <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">채팅 발송 무제한</h4>
                 <p className="text-xs text-gray-500">기본 제공량(100건) 소진 걱정 없이 대화하세요.</p>
              </div>
              <Check size={18} className="text-primary" />
           </div>

           <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                 <Smartphone size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">스토어 정기 결제</h4>
                 <p className="text-xs text-gray-500">구글 플레이/앱스토어 계정으로 간편하게.</p>
              </div>
              <Check size={18} className="text-primary" />
           </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-xl text-[10px] text-gray-500 leading-relaxed">
            <p className="font-bold mb-1">유의사항</p>
            <ul className="list-disc pl-3 space-y-1">
                <li>본 상품은 매월 자동 갱신되는 정기 구독 상품입니다.</li>
                <li>결제는 Google Play 또는 App Store 계정으로 청구됩니다.</li>
                <li>구독 취소는 스토어의 구독 관리 메뉴에서 언제든지 가능합니다.</li>
                <li>기본 제공되는 무료 채팅 100건은 매월 1일 초기화됩니다.</li>
            </ul>
        </div>
      </div>

      {/* Payment Button */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 pb-safe">
         <button 
           onClick={handlePayment}
           disabled={loading}
           className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg active:scale-[0.98]"
         >
            {loading ? (
                '스토어 연결 중...' 
            ) : (
                <>
                    <MessageSquare size={20} />
                    무제한 이용권 구독하기
                </>
            )}
         </button>
      </div>
    </div>
  );
};

export default PartnerSubscriptionPage;
