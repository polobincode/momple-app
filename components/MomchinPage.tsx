
import React, { useState } from 'react';
import { UserState } from '../types';
import { MOCK_USERS } from '../constants';
import { Search, UserPlus, MessageCircle, UserCheck, Edit2, Check, X, User, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MomchinPageProps {
  userState: UserState;
  onToggleFollow: (userId: string) => void;
  onUpdateProfile: (updates: { intro?: string; avatar?: string }) => void;
}

const MomchinPage: React.FC<MomchinPageProps> = ({ userState, onToggleFollow, onUpdateProfile }) => {
  const navigate = useNavigate();
  
  // Edit Intro State
  const [isEditing, setIsEditing] = useState(false);
  const [editIntro, setEditIntro] = useState(userState.intro || '');

  // Search State
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Friend Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserId, setAddUserId] = useState('');

  // Following list: Users I follow
  const followingUsers = MOCK_USERS.filter(u => userState.following.includes(u.id));
  
  // Filtered Following List (Search)
  const filteredFollowing = searchQuery.trim() === '' 
    ? followingUsers 
    : followingUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.intro.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Recommendations: Users I don't follow
  const recommendations = MOCK_USERS.filter(u => !userState.following.includes(u.id) && u.id !== 'me');

  const startChat = (user: typeof MOCK_USERS[0]) => {
      // In real app, create or find chat room ID
      navigate(`/chat/c3`); // Mock navigation
  };

  const handleSaveIntro = () => {
    onUpdateProfile({ intro: editIntro });
    setIsEditing(false);
  };

  const handleCancelIntro = () => {
    setEditIntro(userState.intro || '');
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      onUpdateProfile({ avatar: imageUrl });
    }
  };

  const handleAddUser = () => {
    if (!addUserId.trim()) return;

    // Simulate searching user DB (MOCK_USERS)
    // In real app, this would be an API call
    const targetUser = MOCK_USERS.find(u => u.id === addUserId || u.name === addUserId);

    if (targetUser && targetUser.id !== 'me') {
        if (userState.following.includes(targetUser.id)) {
            alert('이미 팔로우하고 있는 유저입니다.');
        } else {
            onToggleFollow(targetUser.id);
            alert(`${targetUser.name}님을 팔로우했습니다!`);
            setShowAddModal(false);
            setAddUserId('');
        }
    } else {
        alert('사용자를 찾을 수 없습니다.\n정확한 ID 또는 이름을 입력해주세요.');
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 border-b border-gray-100 flex justify-between items-center h-14">
        {isSearchMode ? (
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 animate-fade-in">
             <Search size={16} className="text-gray-400" />
             <input 
               autoFocus
               type="text" 
               placeholder="팔로잉 닉네임, 소개 검색" 
               className="bg-transparent flex-1 text-sm outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button onClick={() => { setIsSearchMode(false); setSearchQuery(''); }}>
               <X size={16} className="text-gray-500" />
             </button>
          </div>
        ) : (
          <>
            <h1 className="font-bold text-xl">팔로잉</h1>
            <div className="flex gap-4 text-gray-800">
              <button onClick={() => setIsSearchMode(true)} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
                <Search size={22} />
              </button>
              <button onClick={() => setShowAddModal(true)} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
                <UserPlus size={22} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* My Profile */}
      {!isSearchMode && (
        <>
          <div className="p-4 flex items-center gap-3">
            <label className="relative cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-gray-100">
                    {userState.avatar ? (
                        <img src={userState.avatar} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>👩</span>
                    )}
                </div>
                {/* Overlay Camera Icon */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-gray-900">{userState.name}</h2>
              
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="text" 
                    value={editIntro}
                    onChange={(e) => setEditIntro(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                    placeholder="상태메시지를 입력하세요"
                    autoFocus
                  />
                  <button onClick={handleSaveIntro} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check size={16} />
                  </button>
                  <button onClick={handleCancelIntro} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <p className="text-xs text-gray-500 truncate">{userState.intro || "상태메시지를 입력해보세요."}</p>
                  <button 
                    onClick={() => {
                      setEditIntro(userState.intro || '');
                      setIsEditing(true);
                    }}
                    className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <hr className="border-gray-100 mx-4 mb-2" />
        </>
      )}

      {/* My Following Section */}
      <div className="p-4">
        <h3 className="text-xs font-bold text-gray-400 mb-3">
            {isSearchMode ? '검색 결과' : `내 팔로잉 ${followingUsers.length}`}
        </h3>
        
        {filteredFollowing.length === 0 ? (
           <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
             {isSearchMode ? '검색된 팔로잉 유저가 없습니다.' : (
               <>아직 팔로잉한 유저가 없어요.<br/>비슷한 관심사의 맘들을 팔로우해보세요!</>
             )}
           </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowing.map(friend => (
              <div key={friend.id} className="flex items-center gap-3">
                 <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover bg-gray-200" />
                 <div className="flex-1 min-w-0" onClick={() => startChat(friend)}>
                   <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                       {friend.name}
                       {friend.isFollowingMe && <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">맞팔</span>}
                   </h4>
                   <p className="text-xs text-gray-500 truncate">{friend.intro}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => onToggleFollow(friend.id)}
                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <UserCheck size={18} />
                    </button>
                    <button onClick={() => startChat(friend)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <MessageCircle size={20} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSearchMode && (
        <>
          <hr className="border-gray-100 mx-4" />
          {/* Recommendations Section */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-400 mb-3">추천 맘</h3>
            <div className="space-y-4">
              {recommendations.map(user => {
                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover bg-gray-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                        {user.name}
                        {user.isFollowingMe && <span className="bg-gray-100 text-[9px] text-gray-500 px-1 py-0.5 rounded font-medium">나를 팔로우 중</span>}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{user.intro}</p>
                    </div>
                    <button 
                      onClick={() => onToggleFollow(user.id)}
                      className="bg-primary text-white hover:bg-primary-dark shadow-sm px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <UserPlus size={14} /> 팔로우
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
           <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl relative">
              <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                  <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                    <UserPlus size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">친구 추가</h3>
                 <p className="text-xs text-gray-500 mt-1">아이디 또는 이름을 정확히 입력해주세요.</p>
              </div>

              <div className="mb-4">
                 <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">아이디 / 이름</label>
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <User size={16} className="text-gray-400 mr-2" />
                    <input 
                       type="text" 
                       value={addUserId}
                       onChange={(e) => setAddUserId(e.target.value)}
                       placeholder="예: happy_mom"
                       className="bg-transparent flex-1 text-sm outline-none"
                       autoFocus
                       onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                    />
                 </div>
                 {/* Hint text for demo purposes since we use mock data */}
                 <p className="text-[10px] text-gray-400 mt-2 px-1">
                    * 테스트용 힌트: '육아고수', '사랑맘', '행복파파', '새내기맘' 등 입력
                 </p>
              </div>

              <button 
                 onClick={handleAddUser}
                 disabled={!addUserId.trim()}
                 className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${addUserId.trim() ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                 친구 추가하기
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default MomchinPage;
