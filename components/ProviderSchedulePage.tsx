
import React, { useState } from 'react';
import { Schedule } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, CheckCircle, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderSchedulePageProps {
  schedules: Schedule[];
  onAddSchedule: (schedule: Schedule) => void;
}

const ProviderSchedulePage: React.FC<ProviderSchedulePageProps> = ({ schedules, onAddSchedule }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal State
  const [newSchedule, setNewSchedule] = useState({
    customerName: '',
    time: '10:00',
    serviceType: '산후조리 일반 (9-18시)',
    note: ''
  });

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const handleAddSchedule = () => {
    if (!newSchedule.customerName) return;
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    const schedule: Schedule = {
      id: `sch_${Date.now()}`,
      date: dateStr,
      time: newSchedule.time,
      customerName: newSchedule.customerName,
      serviceType: newSchedule.serviceType,
      status: 'confirmed',
      note: newSchedule.note
    };

    onAddSchedule(schedule);
    setIsModalOpen(false);
    setNewSchedule({ customerName: '', time: '10:00', serviceType: '산후조리 일반 (9-18시)', note: '' });
  };

  const sendToChat = (schedule: Schedule) => {
    // Navigate to Chat Room with initial message data
    // In a real app, we would find the real chat room ID for this customer.
    // Here we simulate going to a general customer chat
    navigate('/chat/c_customer_1', { 
        state: { 
            bookingInfo: {
                date: schedule.date,
                time: schedule.time,
                service: schedule.serviceType,
                customerName: schedule.customerName
            }
        } 
    });
  };

  // Render Calendar Grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySchedules = schedules.filter(s => s.date === dateStr);
      const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth();

      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`h-14 border-t border-gray-50 flex flex-col items-center justify-start pt-1 cursor-pointer transition-colors relative ${isSelected ? 'bg-primary/5' : ''}`}
        >
          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-primary text-white' : 'text-gray-700'}`}>
            {d}
          </span>
          {daySchedules.length > 0 && (
            <div className="flex gap-0.5 mt-1">
               {daySchedules.slice(0, 3).map((_, i) => (
                   <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"></div>
               ))}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Filter schedules for selected date
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const daysSchedules = schedules.filter(s => s.date === selectedDateStr);

  return (
    <div className="min-h-screen bg-white pb-20">
       {/* Header */}
       <div className="p-4 flex justify-between items-center bg-white border-b border-gray-100">
         <h1 className="font-bold text-xl text-gray-800">일정 관리</h1>
         <button onClick={() => setIsModalOpen(true)} className="bg-gray-900 text-white p-2 rounded-full shadow-md active:scale-95 transition-transform">
           <Plus size={20} />
         </button>
       </div>

       {/* Calendar Controls */}
       <div className="p-4 flex items-center justify-between">
         <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
         <h2 className="text-lg font-bold text-gray-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
         </h2>
         <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
       </div>

       {/* Days of Week */}
       <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2 px-2">
         <div className="text-red-400">일</div>
         <div>월</div>
         <div>화</div>
         <div>수</div>
         <div>목</div>
         <div>금</div>
         <div className="text-blue-400">토</div>
       </div>

       {/* Calendar Grid */}
       <div className="grid grid-cols-7 px-2">
         {renderCalendar()}
       </div>
       
       <hr className="border-t-4 border-gray-100 my-4" />

       {/* Selected Date List */}
       <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
             <CalendarIcon size={18} className="text-primary" />
             <h3 className="font-bold text-gray-800">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정 ({daysSchedules.length})
             </h3>
          </div>

          {daysSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  등록된 일정이 없습니다.
              </div>
          ) : (
              <div className="space-y-3">
                  {daysSchedules.map(schedule => (
                      <div key={schedule.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                              <div>
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                      <Clock size={14} className="text-gray-400" />
                                      {schedule.time}
                                  </div>
                                  <div className="flex items-center gap-2 text-base font-bold text-gray-900 mt-1">
                                      <User size={16} className="text-gray-400" />
                                      {schedule.customerName} 고객님
                                  </div>
                              </div>
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg font-bold border border-green-100">
                                  예약확정
                              </span>
                          </div>
                          <div className="pl-2 mb-3">
                             <p className="text-sm text-gray-600">{schedule.serviceType}</p>
                             {schedule.note && <p className="text-xs text-gray-400 mt-1">memo: {schedule.note}</p>}
                          </div>
                          
                          <button 
                            onClick={() => sendToChat(schedule)}
                            className="w-full py-2 bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200 hover:border-primary/30"
                          >
                             <MessageCircle size={16} />
                             예약 알림 보내기
                          </button>
                      </div>
                  ))}
              </div>
          )}
       </div>

       {/* Add Schedule Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400">
                    <X size={24} />
                </button>
                <h3 className="text-lg font-bold text-gray-800 mb-6">새 일정 등록</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">날짜</label>
                        <div className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">
                            {selectedDate.getFullYear()}년 {selectedDate.getMonth()+1}월 {selectedDate.getDate()}일
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">시간</label>
                        <input 
                          type="time" 
                          value={newSchedule.time}
                          onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                          className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">고객명</label>
                        <input 
                          type="text" 
                          placeholder="고객 이름 입력"
                          value={newSchedule.customerName}
                          onChange={(e) => setNewSchedule({...newSchedule, customerName: e.target.value})}
                          className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">서비스 유형</label>
                        <select 
                          value={newSchedule.serviceType}
                          onChange={(e) => setNewSchedule({...newSchedule, serviceType: e.target.value})}
                          className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option>산후조리 일반 (9-18시)</option>
                            <option>산후조리 입주형 (24시간)</option>
                            <option>프리미엄 케어</option>
                            <option>쌍둥이 케어</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">메모</label>
                        <input 
                          type="text" 
                          placeholder="특이사항 메모"
                          value={newSchedule.note}
                          onChange={(e) => setNewSchedule({...newSchedule, note: e.target.value})}
                          className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <button 
                        onClick={handleAddSchedule}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-primary-dark mt-2"
                    >
                        일정 등록하기
                    </button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default ProviderSchedulePage;
