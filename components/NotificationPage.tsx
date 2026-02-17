import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bell, Megaphone, UserPlus, Star, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'notice' | 'follow' | 'review' | 'system';
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'notice', title: '공지사항', body: '맘플 커뮤니티 이용 수칙이 업데이트되었습니다.', timeAgo: '1시간 전', isRead: false },
  { id: 'n2', type: 'like', title: '좋아요', body: '사랑맘님이 회원님의 게시글을 좋아합니다.', timeAgo: '2시간 전', isRead: false },
  { id: 'n3', type: 'comment', title: '새 댓글', body: '육아고수님이 댓글을 남겼습니다: "정말 도움이 되네요!"', timeAgo: '3시간 전', isRead: false },
  { id: 'n4', type: 'follow', title: '새 팔로워', body: '행복파파님이 회원님을 팔로우하기 시작했습니다.', timeAgo: '5시간 전', isRead: true },
  { id: 'n5', type: 'system', title: '시스템', body: '프로필이 성공적으로 업데이트되었습니다.', timeAgo: '1일 전', isRead: true },
  { id: 'n6', type: 'review', title: '후기 알림', body: '새로운 후기가 등록되었습니다. 확인해보세요.', timeAgo: '2일 전', isRead: true },
];

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
      case 'notice': return <Megaphone size={16} className="text-[#2AC1BC]" />;
      case 'follow': return <UserPlus size={16} className="text-purple-500" />;
      case 'review': return <Star size={16} className="text-yellow-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-800"><ArrowLeft size={24} /></button>
          <h1 className="font-bold text-lg">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
            <Check size={14} /> 모두 읽음
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-50">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-4 flex gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
            onClick={() => {
              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-100'}`}>
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-xs font-bold ${!notif.isRead ? 'text-gray-900' : 'text-gray-500'}`}>{notif.title}</span>
                {!notif.isRead && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
              </div>
              <p className={`text-sm leading-snug line-clamp-2 ${!notif.isRead ? 'text-gray-700' : 'text-gray-400'}`}>{notif.body}</p>
              <span className="text-[10px] text-gray-300 mt-1 block">{notif.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-20 text-gray-300">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">알림이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
