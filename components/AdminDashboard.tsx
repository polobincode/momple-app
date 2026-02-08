
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ShieldAlert, FileText, UserCheck, EyeOff, AlertTriangle, Gavel, MessageSquare, Send, MoreHorizontal } from 'lucide-react';
import { PartnerRequest, ReportItem, SupportTicket, DisciplineAction } from '../types';
import { MOCK_REPORTS, MOCK_SUPPORT_TICKETS } from '../constants';

// Mock Partner Requests (Internal to component as they are specific mock data)
const MOCK_REQUESTS: PartnerRequest[] = [
  { id: 'req1', businessName: '에이스 산후조리', businessNo: '123-45-67890', requestDate: '2023-12-01', status: 'pending' },
  { id: 'req2', businessName: '엄마의 마음', businessNo: '987-65-43210', requestDate: '2023-12-02', status: 'pending' },
  { id: 'req3', businessName: '아가사랑', businessNo: '555-12-34567', requestDate: '2023-12-02', status: 'approved' },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reports' | 'support' | 'partners'>('reports');
  
  // State for Data
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [tickets, setTickets] = useState(MOCK_SUPPORT_TICKETS);

  // State for Discipline Modal
  const [disciplineModal, setDisciplineModal] = useState<{ open: boolean, reportId: string | null }>({ open: false, reportId: null });
  const [disciplineAction, setDisciplineAction] = useState<DisciplineAction>('ban_5');

  // State for Support Reply
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // --- Handlers: Partners ---
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

  // --- Handlers: Reports & Discipline ---
  const handleDismissReport = (id: string) => {
    if (window.confirm('신고를 반려(무혐의) 처리하시겠습니까?')) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    }
  };

  const openDisciplineModal = (reportId: string) => {
    setDisciplineModal({ open: true, reportId });
    setDisciplineAction('ban_5'); // Reset to default
  };

  const confirmDiscipline = () => {
    if (!disciplineModal.reportId) return;
    
    // In a real app, this would send an API request to ban the user
    const reportId = disciplineModal.reportId;
    const actionMap: Record<string, string> = {
        'ban_5': '5일 활동 정지',
        'ban_15': '15일 활동 정지',
        'ban_30': '30일 활동 정지',
        'ban_permanent': '영구 탈퇴 처리'
    };

    alert(`[처리 완료] 해당 회원에게 '${actionMap[disciplineAction]}' 처분이 내려졌습니다.\n게시글은 자동으로 블라인드 처리됩니다.`);
    
    setReports(prev => prev.map(r => r.id === reportId ? { 
        ...r, 
        status: 'resolved', 
        actionTaken: disciplineAction 
    } : r));

    setDisciplineModal({ open: false, reportId: null });
  };

  // --- Handlers: Support ---
  const handleReplySubmit = (ticketId: string) => {
    if (!replyText.trim()) return;
    
    alert('답변이 등록되었습니다.');
    setTickets(prev => prev.map(t => t.id === ticketId ? { 
        ...t, 
        status: 'replied', 
        reply: replyText 
    } : t));
    
    setReplyOpenId(null);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate('/my')}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg text-gray-900">관리자 센터</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 mb-4 sticky top-14 z-10">
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'reports' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'}`}
        >
          <ShieldAlert size={16} /> 신고/징계
        </button>
        <button 
          onClick={() => setActiveTab('support')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'support' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          <MessageSquare size={16} /> 1:1 문의
        </button>
        <button 
          onClick={() => setActiveTab('partners')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'partners' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'}`}
        >
          <UserCheck size={16} /> 파트너스
        </button>
      </div>

      <div className="p-4">
        {/* --- Tab: Reports & Discipline --- */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                    처리할 신고 내역이 없습니다.
                </div>
            )}
            {reports.filter(r => r.status === 'pending').map(rep => (
              <div key={rep.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in-up">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {rep.targetType === 'review' ? '후기' : '게시글'}
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                        피신고자: {rep.targetUser}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">by {rep.reporter}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-4 border border-gray-100 ml-2">
                    <div className="flex gap-2 mb-2">
                        <span className="font-bold text-red-500 whitespace-nowrap">신고 사유</span>
                        <span className="text-gray-700">{rep.reason}</span>
                    </div>
                    <hr className="border-gray-200 my-2"/>
                    <p className="italic text-gray-500">"{rep.contentSnippet}"</p>
                </div>

                <div className="flex gap-2 ml-2">
                  <button 
                    onClick={() => handleDismissReport(rep.id)}
                    className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-lg text-sm font-bold hover:bg-gray-50"
                  >
                    반려 (무혐의)
                  </button>
                  <button 
                    onClick={() => openDisciplineModal(rep.id)}
                    className="flex-[2] py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Gavel size={16} /> 징계 처리
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Reports History (Collapsed by default or simple list) */}
            {reports.filter(r => r.status === 'resolved').length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xs font-bold text-gray-400 mb-2">최근 처리 내역</h3>
                    <div className="space-y-2 opacity-60">
                        {reports.filter(r => r.status === 'resolved').map(rep => (
                            <div key={rep.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center text-xs">
                                <span>{rep.targetUser} ({rep.reason})</span>
                                <span className="font-bold text-red-500">{rep.actionTaken === 'ban_permanent' ? '영구탈퇴' : '정지'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* --- Tab: Support --- */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            {tickets.length === 0 && (
                 <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                    문의 내역이 없습니다.
                </div>
            )}
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
                <div 
                    onClick={() => setReplyOpenId(replyOpenId === ticket.id ? null : ticket.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            {ticket.status === 'pending' ? (
                                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">대기중</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">답변완료</span>
                            )}
                            <span className="font-bold text-sm text-gray-800">{ticket.userName}</span>
                        </div>
                        <span className="text-xs text-gray-400">{ticket.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{ticket.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{ticket.content}</p>
                </div>

                {/* Expanded Detail View */}
                {replyOpenId === ticket.id && (
                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                        <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{ticket.content}</p>
                        
                        {ticket.status === 'replied' ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-primary">관리자 답변</span>
                                </div>
                                <p className="text-sm text-gray-600">{ticket.reply}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="답변 내용을 입력하세요..."
                                    className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg outline-none focus:border-primary resize-none bg-white"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleReplySubmit(ticket.id)}
                                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark flex items-center gap-1"
                                    >
                                        <Send size={14} /> 답변 등록
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- Tab: Partners --- */}
        {activeTab === 'partners' && (
          <div className="space-y-3">
            {requests.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                    대기 중인 승인 요청이 없습니다.
                </div>
            )}
            {requests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in-up">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">{req.businessName}</h3>
                  <span className="text-xs text-gray-400">{req.requestDate}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p><span className="font-bold">사업자번호:</span> {req.businessNo}</p>
                  <p className="text-xs text-blue-500 underline cursor-pointer hover:text-blue-700">사업자등록증 사본 확인 &gt;</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 py-3 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50"
                  >
                    반려
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 shadow-sm"
                  >
                    승인 처리
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discipline Modal */}
      {disciplineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
              <button 
                onClick={() => setDisciplineModal({open: false, reportId: null})}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                  <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-3">
                    <Gavel size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">징계 처분 선택</h3>
                 <p className="text-xs text-gray-500 mt-1">신고 내용을 바탕으로 적절한 제재를 선택하세요.</p>
              </div>

              <div className="space-y-3 mb-6">
                 {[
                    { val: 'ban_5', label: '5일 활동 정지', desc: '경미한 위반 (욕설, 도배)' },
                    { val: 'ban_15', label: '15일 활동 정지', desc: '중간 정도의 위반 (비방, 허위사실)' },
                    { val: 'ban_30', label: '30일 활동 정지', desc: '중대한 위반 (사기, 반복적 위반)' },
                    { val: 'ban_permanent', label: '영구 탈퇴 처리', desc: '심각한 위반 (불법 홍보, 범죄 연루)' },
                 ].map((opt) => (
                    <label 
                        key={opt.val} 
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${disciplineAction === opt.val ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                        <input 
                            type="radio" 
                            name="discipline" 
                            value={opt.val}
                            checked={disciplineAction === opt.val}
                            onChange={(e) => setDisciplineAction(e.target.value as DisciplineAction)}
                            className="mr-3 accent-red-500 w-4 h-4"
                        />
                        <div>
                            <div className={`text-sm font-bold ${disciplineAction === opt.val ? 'text-red-700' : 'text-gray-800'}`}>
                                {opt.label}
                            </div>
                            <div className="text-[10px] text-gray-500">{opt.desc}</div>
                        </div>
                    </label>
                 ))}
              </div>

              <button 
                 onClick={confirmDiscipline}
                 className="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 transition-colors"
              >
                 선택한 징계 적용하기
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
