import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ShieldAlert, FileText, UserCheck, EyeOff, AlertTriangle } from 'lucide-react';
import { PartnerRequest, ReportItem } from '../types';

// Mock Admin Data
const MOCK_REQUESTS: PartnerRequest[] = [
  { id: 'req1', businessName: '에이스 산후조리', businessNo: '123-45-67890', requestDate: '2023-12-01', status: 'pending' },
  { id: 'req2', businessName: '엄마의 마음', businessNo: '987-65-43210', requestDate: '2023-12-02', status: 'pending' },
  { id: 'req3', businessName: '아가사랑', businessNo: '555-12-34567', requestDate: '2023-12-02', status: 'approved' },
];

const MOCK_REPORTS: ReportItem[] = [
  { id: 'rep1', targetType: 'review', targetId: 'r1', reason: '경쟁업체 비방 및 허위 사실 유포', reporter: '해피맘', contentSnippet: '이 업체 정말 별로예요.. 위생상태가..', status: 'pending' },
  { id: 'rep2', targetType: 'post', targetId: 'cp5', reason: '욕설/비하 발언', reporter: 'user123', contentSnippet: '남편 XX 진짜 짜증나네', status: 'pending' },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'reports'>('requests');
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [reports, setReports] = useState(MOCK_REPORTS);

  const handleApprove = (id: string) => {
    if (window.confirm('해당 업체의 가입을 승인하시겠습니까?')) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm('해당 업체의 가입을 거절하시겠습니까?')) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    }
  };

  const handleBlind = (id: string) => {
    if (window.confirm('해당 콘텐츠를 블라인드 처리하시겠습니까?')) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'blinded' } : r));
        alert('블라인드 처리가 완료되었습니다.');
    }
  };

  const handleDismiss = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate('/my')}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg text-primary">관리자 센터 (맘플파트너스)</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 mb-4">
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          가입 승인 관리
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          신고/블라인드 관리
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'requests' ? (
          <div className="space-y-3">
            {requests.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">대기 중인 승인 요청이 없습니다.</div>
            )}
            {requests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">{req.businessName}</h3>
                  <span className="text-xs text-gray-400">{req.requestDate}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p><span className="font-bold">사업자번호:</span> {req.businessNo}</p>
                  <p className="text-xs text-blue-500 underline cursor-pointer">사업자등록증 확인</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50"
                  >
                    거절
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark"
                  >
                    승인
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {reports.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">처리할 신고 내역이 없습니다.</div>
            )}
            {reports.filter(r => r.status === 'pending').map(rep => (
              <div key={rep.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-red-500" />
                    <span className="font-bold text-gray-800 text-sm">
                        {rep.targetType === 'review' ? '후기 신고' : '게시글 신고'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">신고자: {rep.reporter}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-3 border border-gray-100 ml-2">
                    <span className="font-bold text-gray-500 mb-1 block">신고 사유: {rep.reason}</span>
                    <hr className="border-gray-200 my-1.5"/>
                    <p>"{rep.contentSnippet}"</p>
                </div>

                <div className="flex gap-2 ml-2">
                  <button 
                    onClick={() => handleDismiss(rep.id)}
                    className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50"
                  >
                    반려(문제없음)
                  </button>
                  <button 
                    onClick={() => handleBlind(rep.id)}
                    className="flex-1 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <EyeOff size={14} /> 블라인드 처리
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
