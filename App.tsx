
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Baby, Store, ArrowLeft, MessageCircle, Loader2, 
  Home, Search, User, PenSquare, LogOut, Bell, Settings,
  Megaphone, Check, Heart, Star
} from 'lucide-react';
import { 
  UserRole, UserState, CommunityPost 
} from './types';
import { 
  MOCK_COMMUNITY_POSTS 
} from './constants';
import { 
  loginWithGoogle, loginWithKakao, loginWithEmail, signUpWithEmail, initKakao 
} from './services/authService';

// Component Imports
import ProviderDetailPage from './components/ProviderDetailPage';
import { ChatListPage, ChatRoomPage } from './components/ChatPages';
import MomchinPage from './components/MomchinPage';
import { ProviderEditPage, ProviderAdsPage, ProviderReviewsPage, ProviderPointsPage } from './components/ProviderBusinessPages';
import ProviderSchedulePage from './components/ProviderSchedulePage';
import ProviderSearchPage from './components/ProviderSearchPage';
import PostWritePage from './components/PostWritePage';
import PartnerSubscriptionPage from './components/PartnerSubscriptionPage';
import { AdminDashboard } from './components/AdminDashboard';
import DebugPage from './components/DebugPage';

// --- LoginPage Component ---
const LoginPage = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [step, setStep] = useState<'role' | 'social' | 'email' | 'partner-auth'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Partner Fields
  const [businessName, setBusinessName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [repName, setRepName] = useState('');

  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'provider') {
        setIsSignUp(false);
        setStep('partner-auth');
    } else {
        setStep('social');
    }
  };

  const completeLogin = (user: any) => {
    const finalRole = user.role === 'admin' ? 'admin' : (selectedRole || user.role || 'user');
    const userWithRole = { ...user, role: finalRole };
    onLoginSuccess(userWithRole);
  };

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    setIsLoading(true);
    let result;
    if (provider === 'google') result = await loginWithGoogle();
    else result = await loginWithKakao();

    if (result.success && result.user) {
      completeLogin(result.user);
    } else if (result.error) {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (isSignUp) {
        if (selectedRole === 'user' && !name) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        if (selectedRole === 'provider' && (!businessName || !businessNo || !repName)) {
            alert('사업자 정보를 모두 입력해주세요.');
            return;
        }
        if (!email.includes('@')) {
            alert('가입 시에는 유효한 이메일 형식을 입력해주세요.');
            return;
        }
    }

    setIsLoading(true);
    let result;
    
    const displayName = selectedRole === 'provider' ? businessName : name;

    if (isSignUp) {
      result = await signUpWithEmail(email, password, displayName);
    } else {
      const isEmail = email.includes('@');
      if (!isEmail && selectedRole === 'provider') {
          // Mock login for providers with ID
          await new Promise(resolve => setTimeout(resolve, 500));
          if (email === 'admin') {
              result = {
                  success: true,
                  user: {
                      uid: 'admin_master',
                      email: null,
                      displayName: '총괄 관리자',
                      photoURL: null,
                      role: 'admin'
                  }
              };
          } else {
              result = {
                  success: true,
                  user: {
                      uid: `provider_${email}`,
                      email: null,
                      displayName: email,
                      photoURL: null,
                      role: 'provider'
                  }
              };
          }
      } else {
          result = await loginWithEmail(email, password);
      }
    }

    if (result.success && result.user) {
      if (selectedRole === 'provider' && isSignUp) {
          result.user = {
              ...result.user,
              providerInfo: {
                  businessName,
                  businessRegNo: businessNo,
                  representative: repName
              }
          };
      }
      completeLogin(result.user);
    } else if (result.error) {
      alert(result.error);
    }
    setIsLoading(false);
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-6 animate-fade-in">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#2AC1BC] mb-3 tracking-tighter">Momple</h1>
          <p className="text-gray-500 text-base">어떤 회원으로 시작하시겠어요?</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleRoleSelect('user')}
            className="w-full bg-white border-2 border-gray-100 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-[#2AC1BC] hover:bg-teal-50/30 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 bg-[#2AC1BC]/10 rounded-full flex items-center justify-center text-[#2AC1BC] mb-1 group-hover:scale-110 transition-transform">
              <Baby size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">맘 회원</h3>
              <p className="text-xs text-gray-400 mt-1">육아 정보 공유 및 커뮤니티 이용</p>
            </div>
          </button>

          <button 
            onClick={() => handleRoleSelect('provider')}
            className="w-full bg-white border-2 border-gray-100 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-gray-800 hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-1 group-hover:scale-110 transition-transform">
              <Store size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">파트너스</h3>
              <p className="text-xs text-gray-400 mt-1">업체 등록 및 홍보 관리</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'social') {
    return (
      <div className="min-h-screen bg-white flex flex-col animate-fade-in relative">
         <button onClick={() => setStep('role')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-800">
           <ArrowLeft size={24} />
         </button>
         <div className="flex-1 flex flex-col justify-center px-8">
            <div className="mb-20 text-center">
              <h1 className="text-4xl font-bold mb-2 tracking-tighter text-[#2AC1BC]">Momple</h1>
              <p className="text-gray-800 font-bold text-sm">클린한 초보맘들의 커뮤니티</p>
            </div>
            <div className="space-y-3 mb-6">
              <button onClick={() => handleSocialLogin('kakao')} className="w-full bg-[#FEE500] text-[#3c1e1e] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                <MessageCircle fill="currentColor" size={20} /> 카카오로 3초만에 시작하기
              </button>
              <button onClick={() => handleSocialLogin('google')} className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                 <span className="text-lg">G</span> 구글로 계속하기
              </button>
            </div>
            <div className="text-center">
               <button onClick={() => setStep('email')} className="text-gray-400 text-xs underline underline-offset-4 hover:text-gray-600">이메일 로그인</button>
            </div>
         </div>
      </div>
    );
  }

  if (step === 'email') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-8 animate-fade-in">
         <div className="h-14 flex items-center -mx-2">
           <button onClick={() => setStep('social')} className="p-2 text-gray-400 hover:text-gray-800"><ArrowLeft size={24} /></button>
         </div>
         <div className="flex-1 flex flex-col justify-center pb-20">
           <div className="mb-10">
             <h1 className="text-2xl font-bold mb-2 text-[#2AC1BC]">이메일로 시작하기</h1>
             <p className="text-gray-500 text-sm">정보를 입력하여 로그인을 진행해주세요.</p>
           </div>
           <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                 <input type="text" placeholder="이름 (닉네임)" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC]" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" placeholder="이메일" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC]" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="비밀번호 (6자리 이상)" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC]" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-3.5 rounded-xl transition-colors shadow-md bg-[#2AC1BC] hover:bg-[#209692]">
                 {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUp ? '회원가입' : '로그인')}
              </button>
           </form>
           <div className="text-center mt-6">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4">
                 {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 계정이 없으신가요? 회원가입'}
              </button>
           </div>
         </div>
      </div>
    );
  }

  if (step === 'partner-auth') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-8 animate-fade-in">
         <div className="h-14 flex items-center -mx-2">
           <button onClick={() => setStep('role')} className="p-2 text-gray-400 hover:text-gray-800"><ArrowLeft size={24} /></button>
         </div>
         <div className="flex-1 flex flex-col justify-center pb-20">
           <div className="mb-10">
             <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">{isSignUp ? '파트너스 가입 신청' : '파트너스 로그인'}</h1>
             <p className="text-gray-500 text-sm">{isSignUp ? '사업자 정보를 입력하여 가입을 신청해주세요.' : '성공적인 비즈니스의 시작'}</p>
           </div>
           <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-3 animate-fade-in-up">
                    <input type="text" placeholder="상호명" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-gray-900 bg-gray-50" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    <input type="text" placeholder="사업자 등록번호" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-gray-900 bg-gray-50" value={businessNo} onChange={(e) => setBusinessNo(e.target.value)} />
                    <input type="text" placeholder="대표자 성명" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-gray-900 bg-gray-50" value={repName} onChange={(e) => setRepName(e.target.value)} />
                    <div className="h-px bg-gray-200 my-2"></div>
                </div>
              )}
              <input type="text" placeholder="이메일 (아이디)" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="비밀번호" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-4 rounded-xl transition-colors shadow-md bg-gray-900 hover:bg-black mt-2">
                 {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUp ? '가입 신청하기' : '로그인')}
              </button>
           </form>
           <div className="text-center mt-6">
              <button onClick={() => { setIsSignUp(!isSignUp); setBusinessName(''); setBusinessNo(''); setRepName(''); }} className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4">
                 {isSignUp ? '이미 계정이 있으신가요? 로그인' : '파트너스 계정이 없으신가요? 가입 신청'}
              </button>
           </div>
         </div>
      </div>
    );
  }
  return null;
};

// --- Helper Components ---
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  if (path === '/login' || path.startsWith('/chat/') || path.startsWith('/write') || path.startsWith('/provider/') || path === '/partner-subscription') return null;

  const navItems = [
    { icon: <Home size={24} />, label: '커뮤니티', path: '/' },
    { icon: <Search size={24} />, label: '이모찾기', path: '/search' },
    { icon: <User size={24} />, label: '육아동지', path: '/momchin' },
    { icon: <MessageCircle size={24} />, label: 'DM', path: '/chat' },
    { icon: <User size={24} />, label: 'MY', path: '/my' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 pb-safe">
      {navItems.map((item) => (
        <button key={item.label} onClick={() => navigate(item.path)} className={`flex flex-col items-center justify-center w-full h-full ${path === item.path ? 'text-[#2AC1BC]' : 'text-gray-400'}`}>
          {item.icon}
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const HomePage = ({ user, posts }: { user: UserState, posts: CommunityPost[] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'notice'>('all');

  const getDisplayPosts = () => {
      let filtered = posts;
      if (activeTab === 'popular') filtered = posts.filter(p => p.isPopular);
      else if (activeTab === 'notice') filtered = posts.filter(p => p.isNotice);
      else {
          const notices = posts.filter(p => p.isNotice);
          const others = posts.filter(p => !p.isNotice);
          return [...notices, ...others];
      }
      return filtered;
  };
  const displayPosts = getDisplayPosts();
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
         <h1 className="text-xl font-bold text-[#2AC1BC]">Momple</h1>
         <div className="flex gap-4">
            <button onClick={() => navigate('/notifications')} className="relative">
               <Bell size={24} className="text-gray-600" />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
         </div>
      </div>
      <div className="bg-white px-4 pt-2 pb-0 mb-3 border-b border-gray-100">
         <div className="flex items-center justify-between mb-2"><h2 className="font-bold text-lg text-gray-800">맘커뮤니티</h2></div>
         <div className="flex gap-6">
             <button onClick={() => setActiveTab('all')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all' ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent'}`}>전체</button>
             <button onClick={() => setActiveTab('popular')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'popular' ? 'text-red-500 border-red-500' : 'text-gray-400 border-transparent'}`}>인기글</button>
             <button onClick={() => setActiveTab('notice')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'notice' ? 'text-[#2AC1BC] border-[#2AC1BC]' : 'text-gray-400 border-transparent'}`}>공지사항</button>
         </div>
      </div>
      <div className="p-4 pt-0">
         <div className="space-y-3">
            {displayPosts.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">게시글이 없습니다.</div>}
            {displayPosts.map(post => {
               const isAdmin = post.authorId === 'momple' || post.authorName === 'momple' || post.authorId === 'admin_master';
               return (
               <div key={post.id} className={`p-4 rounded-xl shadow-sm border ${post.isNotice ? 'bg-teal-50/50 border-teal-100' : 'bg-white border-gray-100'}`}>
                  {post.isNotice && (
                      <div className="flex items-center gap-1 mb-2 text-[#2AC1BC]">
                          <Megaphone size={12} fill="currentColor" />
                          <span className="text-xs font-bold">공지사항</span>
                      </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                     {!post.isNotice && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${post.isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{post.isPopular ? 'HOT' : '일상'}</span>}
                     <h3 className={`text-sm truncate flex-1 text-gray-800 ${post.isNotice ? 'font-black text-base' : 'font-bold'}`}>{post.title}</h3>
                     <span className="text-xs text-gray-400">{post.timeAgo}</span>
                  </div>
                  <p className={`text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed ${post.isNotice ? 'text-gray-700 font-medium' : ''}`}>{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt="post" className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <div className={`flex items-center justify-between text-xs pt-2 ${post.isNotice ? 'border-t border-teal-100/50' : 'border-t border-gray-50'}`}>
                     <div className="flex items-center gap-1">
                        <span className={`font-bold ${isAdmin ? 'text-gray-900' : 'text-gray-600'}`}>{post.authorName}</span>
                        {isAdmin && <span className="text-[10px] bg-[#2AC1BC] text-white px-1.5 py-0.5 rounded font-bold ml-0.5 flex items-center gap-0.5"><Check size={8} strokeWidth={4} />관리자</span>}
                        {!post.isNotice && <><span className="text-gray-300 mx-1">·</span><span className="text-gray-400">조회 {post.viewCount}</span></>}
                     </div>
                     {!post.isNotice && <div className="flex items-center gap-3 text-gray-400"><span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span><span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span></div>}
                  </div>
               </div>
            )})}
         </div>
      </div>
      <button onClick={() => navigate('/write')} className="fixed bottom-20 right-4 bg-[#2AC1BC] text-white p-4 rounded-full shadow-lg hover:bg-[#209692] transition-colors z-40"><PenSquare size={24} /></button>
    </div>
  );
};

const MegaphoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const DollarSignIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const MyPage = ({ user, onLogout }: { user: UserState, onLogout: () => void }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-5 mb-2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                       <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                        <p className="text-xs text-gray-500">{user.email || 'momple@momple.com'}</p>
                        <p className="text-xs text-gray-400 mt-1">{user.role === 'provider' ? '파트너스 회원' : '일반 회원'}</p>
                    </div>
                    <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
                </div>
                <div className="flex gap-2">
                    {user.role === 'provider' ? <button onClick={() => navigate('/provider-edit')} className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-bold text-gray-600">업체 정보 관리</button> : <button className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-bold text-gray-600">프로필 수정</button>}
                    <button className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-bold text-gray-600">설정</button>
                </div>
            </div>
            {user.role === 'provider' && user.providerInfo && (
                <div className="bg-white p-4 mb-2">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">비즈니스 관리</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/provider-schedule')} className="bg-blue-50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Settings size={20} /></div><span className="text-xs font-bold text-gray-700">일정 관리</span></button>
                        <button onClick={() => navigate('/provider-reviews')} className="bg-purple-50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm"><Star size={20} /></div><span className="text-xs font-bold text-gray-700">후기 관리</span></button>
                        <button onClick={() => navigate('/provider-ads')} className="bg-orange-50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm"><MegaphoneIcon /></div><span className="text-xs font-bold text-gray-700">광고 관리</span></button>
                        <button onClick={() => navigate('/provider-points')} className="bg-green-50 p-4 rounded-xl flex flex-col items-center gap-2"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><DollarSignIcon /></div><span className="text-xs font-bold text-gray-700">포인트 충전</span></button>
                    </div>
                </div>
            )}
            <div className="bg-white p-4">
               <h3 className="font-bold text-gray-800 mb-3 text-sm">고객센터</h3>
               <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex justify-between"><span>공지사항</span> <ArrowLeft size={16} className="rotate-180 text-gray-300" /></li>
                   <li className="flex justify-between"><span>자주 묻는 질문</span> <ArrowLeft size={16} className="rotate-180 text-gray-300" /></li>
                   <li className="flex justify-between"><span>1:1 문의</span> <ArrowLeft size={16} className="rotate-180 text-gray-300" /></li>
                   <li className="flex justify-between" onClick={() => navigate('/admin')}><span>관리자 페이지 (Demo)</span> <ArrowLeft size={16} className="rotate-180 text-gray-300" /></li>
                   <li className="flex justify-between" onClick={() => navigate('/debug')}><span>디버그 페이지</span> <ArrowLeft size={16} className="rotate-180 text-gray-300" /></li>
               </ul>
            </div>
        </div>
    );
};

function App() {
  const [user, setUser] = useState<UserState | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  
  useEffect(() => { initKakao(); }, []);

  const handleLoginSuccess = (userData: any) => {
     const newUser: UserState = {
         isAuthenticated: true,
         role: userData.role || 'user',
         name: userData.displayName || 'User',
         email: userData.email,
         points: 1000,
         followerCount: 0,
         following: [],
         postCount: 0,
         commentCount: 0,
         unlockedProviders: [],
         viewedReviews: {},
         providerInfo: userData.providerInfo,
         chatUsage: 0
     };
     setUser(newUser);
  };

  const handleLogout = () => { setUser(null); };

  const handleWritePost = (title: string, content: string, imageUrl?: string, isNotice: boolean = false) => {
     const newPost: CommunityPost = {
         id: `new_${Date.now()}`,
         title,
         content,
         imageUrl,
         authorId: user?.email === 'momple@momple.com' || user?.name === 'momple' ? 'momple' : 'me',
         authorName: user?.name || '익명',
         authorBadge: '새내기',
         timeAgo: '방금 전',
         viewCount: 0,
         likeCount: 0,
         commentCount: 0,
         isPopular: false,
         isNotice: isNotice
     };
     setPosts([newPost, ...posts]);
  };

  return (
    <HashRouter>
       <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
         <Routes>
            <Route path="/login" element={!user ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
            {user ? (
               <>
                 <Route path="/" element={<HomePage user={user} posts={posts} />} />
                 <Route path="/search" element={<ProviderSearchPage userState={user} />} />
                 <Route path="/momchin" element={<MomchinPage userState={user} onToggleFollow={() => {}} onUpdateProfile={() => {}} />} />
                 <Route path="/chat" element={<ChatListPage />} />
                 <Route path="/chat/:id" element={<ChatRoomPage userState={user} />} />
                 <Route path="/my" element={<MyPage user={user} onLogout={handleLogout} />} />
                 <Route path="/provider/:id" element={<ProviderDetailPage onWriteReview={() => {}} />} />
                 <Route path="/write" element={<PostWritePage onWritePost={handleWritePost} />} />
                 <Route path="/provider-edit" element={<ProviderEditPage userState={user} onUpdate={() => {}} />} />
                 <Route path="/provider-ads" element={<ProviderAdsPage />} />
                 <Route path="/provider-reviews" element={<ProviderReviewsPage reviews={[]} onUpdateReview={() => {}} />} />
                 <Route path="/provider-points" element={<ProviderPointsPage currentPoints={user.points} onCharge={() => {}} />} />
                 <Route path="/provider-schedule" element={<ProviderSchedulePage schedules={[]} onAddSchedule={() => {}} />} />
                 <Route path="/partner-subscription" element={<PartnerSubscriptionPage onSubscribe={() => {}} />} />
                 <Route path="/admin" element={<AdminDashboard />} />
                 <Route path="/debug" element={<DebugPage />} />
               </>
            ) : (
               <Route path="*" element={<Navigate to="/login" />} />
            )}
         </Routes>
         {user && <BottomNav />}
       </div>
    </HashRouter>
  );
}

export default App;
