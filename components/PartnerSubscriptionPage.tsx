import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

interface PartnerSubscriptionPageProps {
  onSubscribe: () => void;
}

const PartnerSubscriptionPage: React.FC<PartnerSubscriptionPageProps> = ({ onSubscribe }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate Payment Process
    setTimeout(() => {
      setLoading(false);
      alert('카카오페이 정기 결제가 완료되었습니다.\n파트너스 멤버십이 시작됩니다!');
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
        <h1 className="font-bold text-lg">서비스 이용료 결제</h1>
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-24">
        {/* Banner */}
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
           <div className="relative z-10">
             <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">PARTNER MEMBERSHIP</span>
             <h2 className="text-2xl font-bold mb-1">맘플 파트너스 프리미엄</h2>
             <p className="text-gray-300 text-sm">성공적인 마케팅과 효율적인 고객관리</p>
           </div>
           <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <ShieldCheck size={150} />
           </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center mb-6">
           <p className="text-gray-500 text-sm font-medium mb-1">월 정기 구독료</p>
           <div className="flex items-end justify-center gap-1 mb-4">
              <span className="text-4xl font-bold text-gray-900">29,000</span>
              <span className="text-gray-600 mb-1">원</span>
           </div>
           <p className="text-xs text-gray-400">VAT 포함, 매월 자동 결제</p>
        </div>

        {/* Features List */}
        <h3 className="font-bold text-gray-800 mb-4 ml-1">멤버십 혜택</h3>
        <div className="space-y-3">
           <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                 <Zap size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">업체 정보 무제한 수정</h4>
                 <p className="text-xs text-gray-500">언제든지 최신 정보로 업데이트하세요.</p>
              </div>
              <Check size={18} className="text-primary" />
           </div>

           <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                 <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">베스트 후기 선정 권한</h4>
                 <p className="text-xs text-gray-500">좋은 후기를 상단에 고정하여 신뢰도를 높이세요.</p>
              </div>
              <Check size={18} className="text-primary" />
           </div>

           <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                 <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">1:1 문의 DM & 예약 관리</h4>
                 <p className="text-xs text-gray-500">놓치는 고객 없이 실시간으로 소통하세요.</p>
              </div>
              <Check size={18} className="text-primary" />
           </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 pb-safe">
         <button 
           onClick={handlePayment}
           disabled={loading}
           className="w-full bg-[#FEE500] text-[#000000] py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors shadow-lg active:scale-[0.98]"
         >
            {loading ? (
                '결제 처리 중...' 
            ) : (
                <>
                    <MessageSquare size={20} fill="currentColor" />
                    카카오페이로 정기 결제하기
                </>
            )}
         </button>
      </div>
    </div>
  );
};

export default PartnerSubscriptionPage;
