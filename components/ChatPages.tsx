
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChatRoom, ChatMessage, ChatStatus } from '../types';
import { MOCK_CHATS } from '../constants';
import { ArrowLeft, Send, Search, MoreVertical, Phone, Calendar, CheckCircle, Clock, ShieldAlert, UserCheck, Timer } from 'lucide-react';

// --- Chat List Page ---

export const ChatListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'provider' | 'dm'>('all');

  const filteredChats = filter === 'all' 
    ? MOCK_CHATS.filter(c => c.type !== 'market') 
    : MOCK_CHATS.filter(c => c.type === filter);

  const getBadge = (type: string) => {
    switch(type) {
      case 'provider': return <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold border border-secondary/20">업체상담</span>;
      case 'dm': return <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold border border-purple-200">DM</span>;
      default: return null;
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
        <h1 className="font-bold text-xl mb-4">대화</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'provider', 'dm'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' && '전체'}
              {f === 'provider' && '업체문의'}
              {f === 'dm' && '맘플 DM'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filteredChats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <img src={chat.targetImage} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-200" />
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {chat.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 truncate">{chat.targetName}</span>
                  {getBadge(chat.type)}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{chat.lastMessageTime}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Chat Room Page ---

export const ChatRoomPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Constants for ephemeral messages
  const EPHEMERAL_DURATION = 10000; // 10 seconds for demo (Telegram style)

  // Find chat or initialize mock for new DM
  const existingChat = MOCK_CHATS.find(c => c.id === id);
  const initialChat: ChatRoom = existingChat || {
    id: id || 'temp',
    type: 'dm', // Default to DM if creating new
    targetId: location.state?.targetId || 'unknown',
    targetName: location.state?.targetName || '알 수 없음',
    targetImage: location.state?.targetImage || 'https://picsum.photos/50/50',
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0,
    messages: [],
    status: location.state?.isNewRequest ? 'pending' : 'active'
  };

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat.messages);
  const [status, setStatus] = useState<ChatStatus>(initialChat.status || 'active');

  // Handle incoming booking info from ProviderSchedulePage
  useEffect(() => {
      if (location.state?.bookingInfo) {
          const info = location.state.bookingInfo;
          const systemMsg: ChatMessage = {
              id: `sys_${Date.now()}`,
              senderId: 'me',
              text: '예약이 확정되었습니다.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'booking',
              bookingInfo: {
                  date: info.date,
                  time: info.time,
                  service: info.service
              }
          };
          setMessages(prev => [...prev, systemMsg]);
          window.history.replaceState({}, document.title);
      }
  }, [location.state]);

  // Ephemeral Message Logic: Periodically remove expired messages
  useEffect(() => {
      // Only for DM type chats that are active
      if (initialChat.type === 'dm' && status === 'active') {
          const interval = setInterval(() => {
              const now = Date.now();
              setMessages(prev => prev.filter(msg => !msg.expiresAt || msg.expiresAt > now));
          }, 1000); // Check every second

          return () => clearInterval(interval);
      }
  }, [initialChat.type, status]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // For DMs, add expiry time
    const expiresAt = initialChat.type === 'dm' ? Date.now() + EPHEMERAL_DURATION : undefined;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      expiresAt: expiresAt
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate reply if active
    if (status === 'active') {
        setTimeout(() => {
           const reply: ChatMessage = {
             id: (Date.now() + 1).toString(),
             senderId: 'other',
             text: '네 확인했습니다.',
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             type: 'text',
             expiresAt: expiresAt ? Date.now() + EPHEMERAL_DURATION : undefined
           };
           setMessages(prev => [...prev, reply]);
        }, 1000);
    }
  };

  const handleAccept = () => {
      setStatus('active');
      // Add a system message
      const sysMsg: ChatMessage = {
          id: `sys_${Date.now()}`,
          senderId: 'system',
          text: '대화 요청이 수락되었습니다. 이제 채팅이 가능합니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'system'
      };
      setMessages(prev => [...prev, sysMsg]);
  };

  const renderMessage = (msg: ChatMessage) => {
      if (msg.type === 'booking' && msg.bookingInfo) {
          return (
              <div key={msg.id} className="flex justify-end mb-3 w-full">
                  <div className="bg-white border border-primary/30 rounded-2xl overflow-hidden shadow-sm w-64">
                      <div className="bg-primary/10 p-3 border-b border-primary/10 flex items-center gap-2">
                          <CheckCircle size={16} className="text-primary" />
                          <span className="font-bold text-primary text-sm">예약 확정 알림</span>
                      </div>
                      <div className="p-4">
                          <h3 className="font-bold text-gray-800 text-base mb-2">{msg.bookingInfo.service}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span>{msg.bookingInfo.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 flex items-center justify-center border border-gray-400 rounded-full text-[8px] font-bold text-gray-400">Time</div>
                                  <span>{msg.bookingInfo.time}</span>
                              </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                              예약이 정상적으로 확정되었습니다.
                          </p>
                      </div>
                  </div>
              </div>
          );
      }

      if (msg.type === 'system') {
          return (
              <div key={msg.id} className="flex justify-center mb-4">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.text}</span>
              </div>
          );
      }

      const isMe = msg.senderId === 'me';
      
      return (
        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
          <div className="max-w-[75%]">
            <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${
                isMe 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
                {msg.text}
            </div>
            {/* Ephemeral Timer Indicator */}
            {msg.expiresAt && (
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? 'justify-end text-primary/70' : 'justify-start text-gray-300'}`}>
                    <Timer size={10} />
                    <span>자동 삭제 예정</span>
                </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 self-end mx-1 mb-1 whitespace-nowrap">
            {msg.timestamp}
          </span>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-800">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
             <div className="relative">
                <img src={initialChat.targetImage} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                {status === 'active' && initialChat.type === 'dm' && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border border-white"></div>
                )}
             </div>
             <div>
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                    {initialChat.targetName}
                </h2>
                <span className="text-xs text-gray-500">
                {initialChat.type === 'provider' ? '업체 상담' : '맘플 DM'}
                </span>
             </div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600">
          {initialChat.type === 'provider' && <Phone size={22} />}
          <Search size={22} />
          <MoreVertical size={22} />
        </div>
      </div>
      
      {/* Ephemeral Notice */}
      {initialChat.type === 'dm' && status === 'active' && (
          <div className="bg-gray-50 px-4 py-2 text-center border-b border-gray-100">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Timer size={12} className="text-primary" />
                  보안을 위해 메시지는 <span className="font-bold text-primary">10초 후 자동 삭제</span>됩니다.
              </p>
          </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F2F3F7]" ref={scrollRef}>
        {/* Render Accept/Decline UI if pending */}
        {status === 'pending' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-2">
                    👋
                </div>
                <h3 className="font-bold text-gray-800 text-lg">새로운 대화 요청</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    <span className="font-bold text-gray-900">{initialChat.targetName}</span>님이 대화를 요청했습니다.<br/>
                    수락하시면 비밀 대화가 시작되며,<br/>일정 시간 후 메시지가 자동 삭제됩니다.
                </p>
                <div className="flex gap-3 w-full max-w-xs pt-4">
                    <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-600 text-sm hover:bg-gray-300">
                        거절
                    </button>
                    <button onClick={handleAccept} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark shadow-md shadow-primary/20">
                        수락하고 대화하기
                    </button>
                </div>
            </div>
        )}

        {/* Messages */}
        {status === 'active' && messages.length === 0 && (
             <div className="py-10 text-center text-gray-400 text-sm">
                 대화 내용이 없습니다. <br/>인사를 건네보세요!
             </div>
        )}
        {status === 'active' && messages.map(renderMessage)}
      </div>

      {/* Input */}
      {status === 'active' && (
        <div className="p-3 bg-white border-t border-gray-100 pb-safe">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
            <input 
                type="text" 
                className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-colors ${input.trim() ? 'text-primary' : 'text-gray-400'}`}
            >
                <Send size={20} />
            </button>
            </div>
        </div>
      )}
    </div>
  );
};
