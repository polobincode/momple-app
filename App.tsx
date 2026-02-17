
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  ArrowLeft, MessageCircle, Loader2,
  Home, Search, User, PenSquare, LogOut, Bell, Settings,
  Megaphone, Check, Heart, Star,
  Camera, Edit2, X, ChevronRight, AlertTriangle, FileText, Headphones
} from 'lucide-react';
import { 
  UserRole, UserState, CommunityPost 
} from './types';
import {
  MOCK_COMMUNITY_POSTS, FORBIDDEN_WORDS
} from './constants';
import {
  loginWithGoogle, loginWithEmail, signUpWithEmail, handleGoogleRedirect
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
import PostDetailPage from './components/PostDetailPage';
import NotificationPage from './components/NotificationPage';

// --- LoginPage Component ---
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPage = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [step, setStep] = useState<'main' | 'email' | 'partner-auth'>('main');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Partner Fields
  const [businessName, setBusinessName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [repName, setRepName] = useState('');

  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const completeLogin = (user: any) => {
    const finalRole = user.role === 'admin' ? 'admin' : (selectedRole || user.role || 'user');
    const userWithRole = { ...user, role: finalRole };
    onLoginSuccess(userWithRole);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setSelectedRole('user');
    const result = await loginWithGoogle();
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
            alert('유효한 이메일 형식을 입력해주세요.');
            return;
        }
    }

    setIsLoading(true);
    let result;

    const displayName = selectedRole === 'provider' ? businessName : name;

    if (isSignUp) {
      result = await signUpWithEmail(email, password, displayName);
    } else {
      // 일반회원 테스트 계정
      if (email === 'momple@qasolution.com' && password === 'dkdlfltm1!' && selectedRole === 'user') {
          await new Promise(resolve => setTimeout(resolve, 500));
          result = {
              success: true,
              user: {
                  uid: 'test_user_momple',
                  email: 'momple@qasolution.com',
                  displayName: '맘플 테스터',
                  photoURL: null,
                  role: 'user'
              }
          };
      // 파트너스 로그인 (아이디 방식)
      } else if (!email.includes('@') && selectedRole === 'provider') {
          await new Promise(resolve => setTimeout(resolve, 500));
          if ((email === 'momple' || email === 'admin') && password === 'dkdlfltm1!') {
              result = {
                  success: true,
                  user: {
                      uid: 'admin_master',
                      email: 'admin@momple.com',
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

  // 메인 화면: 일반회원 로그인이 주(primary) 플로우
  if (step === 'main') {
    return (
      <div className="min-h-screen bg-white flex flex-col animate-fade-in">
         <div className="flex-1 flex flex-col px-8">
            {/* 로고 영역: 상단 40% 위치 */}
            <div className="mt-[35vh] text-center mb-auto">
              <h1 className="text-4xl font-bold mb-2 tracking-tighter text-[#2AC1BC]">Momple</h1>
              <p className="text-gray-500 text-sm">클린한 초보맘들의 커뮤니티</p>
            </div>

            {/* 버튼 영역: 하단 고정 */}
            <div className="pb-6">
              <div className="space-y-2.5 mb-5">
                {/* Google 로그인 */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <GoogleIcon />
                      Google 계정으로 시작하기
                    </>
                  )}
                </button>

                {/* 이메일 로그인/회원가입 */}
                <button
                  onClick={() => { setSelectedRole('user'); setStep('email'); }}
                  className="w-full bg-[#2AC1BC] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#209692] transition-colors"
                >
                  이메일로 시작하기
                </button>
              </div>

              <div className="text-center text-[11px] text-gray-400 leading-relaxed mb-5">
                가입 시 <span className="underline">서비스 이용약관</span> 및 <span className="underline">개인정보 처리방침</span>에 동의하게 됩니다.
              </div>

              {/* 파트너스 로그인: 하단 작은 텍스트 */}
              <div className="text-center pb-2">
                <button
                  onClick={() => { setSelectedRole('provider'); setIsSignUp(false); setStep('partner-auth'); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  파트너스(업체) 로그인 &rarr;
                </button>
              </div>
            </div>
         </div>
      </div>
    );
  }

  // 이메일 로그인/회원가입 (일반회원)
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-8 animate-fade-in">
         <div className="h-14 flex items-center -mx-2">
           <button onClick={() => setStep('main')} className="p-2 text-gray-400 hover:text-gray-800"><ArrowLeft size={24} /></button>
         </div>
         <div className="flex-1 flex flex-col justify-center pb-20">
           <div className="mb-10">
             <h1 className="text-2xl font-bold mb-2 text-[#2AC1BC]">{isSignUp ? '회원가입' : '이메일 로그인'}</h1>
             <p className="text-gray-500 text-sm">{isSignUp ? '정보를 입력하여 가입해주세요.' : '이메일과 비밀번호를 입력해주세요.'}</p>
           </div>
           <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                 <input type="text" placeholder="닉네임" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC] transition-colors" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" placeholder="이메일" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC] transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="비밀번호 (6자리 이상)" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2AC1BC] transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} />
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

  // 파트너스 로그인/가입
  if (step === 'partner-auth') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-8 animate-fade-in">
         <div className="h-14 flex items-center -mx-2">
           <button onClick={() => { setSelectedRole('user'); setStep('main'); }} className="p-2 text-gray-400 hover:text-gray-800"><ArrowLeft size={24} /></button>
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

  if (path === '/login' || path.startsWith('/chat/') || path.startsWith('/write') || path.startsWith('/provider/') || path.startsWith('/post/') || path === '/partner-subscription' || path === '/notifications') return null;

  const navItems = [
    { icon: <Home size={24} />, label: '커뮤니티', path: '/' },
    { icon: <Search size={24} />, label: '이모찾기', path: '/search' },
    { icon: <User size={24} />, label: '육아동지', path: '/momchin' },
    { icon: <MessageCircle size={24} />, label: 'DM', path: '/chat' },
    { icon: <User size={24} />, label: 'MY', path: '/my' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 pb-safe">
      {navItems.map((item) => (
        <button key={item.label} onClick={() => navigate(item.path)} className={`flex flex-col items-center justify-center w-full h-full ${path === item.path ? 'text-[#2AC1BC]' : 'text-gray-400'}`}>
          {item.icon}
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Google AdMob Native Ad Placeholder ---
// Capacitor 전환 후 @admob-plus/capacitor로 교체
// 현재는 게시글과 동일한 UI의 네이티브 광고 플레이스홀더
const NATIVE_AD_DATA = [
  { headline: '산후도우미 비용 비교', body: '우리 지역 산후도우미 가격을 한눈에 비교해보세요', advertiser: '맘플 파트너스', icon: 'https://picsum.photos/40/40?random=ad1', image: 'https://picsum.photos/400/200?random=ad10' },
  { headline: '첫 달 무료 체험', body: '프리미엄 산후관리 서비스, 지금 무료 체험 신청하세요', advertiser: '해피맘케어', icon: 'https://picsum.photos/40/40?random=ad2', image: 'https://picsum.photos/400/200?random=ad11' },
  { headline: '신생아용품 특가 세일', body: '엄선된 육아용품을 최대 50% 할인된 가격에 만나보세요', advertiser: '베이비마트', icon: 'https://picsum.photos/40/40?random=ad3', image: 'https://picsum.photos/400/200?random=ad12' },
];

const NativeAdPlaceholder = ({ index }: { index: number }) => {
  const ad = NATIVE_AD_DATA[index % NATIVE_AD_DATA.length];
  return (
    <div id={`admob-native-${index}`} className="p-4 rounded-xl shadow-sm border border-gray-100 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600 border border-yellow-100">AD</span>
        <h3 className="text-sm font-bold truncate flex-1 text-gray-800">{ad.headline}</h3>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">{ad.body}</p>
      {ad.image && <img src={ad.image} alt="ad" className="w-full h-32 object-cover rounded-lg mb-3" />}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <img src={ad.icon} alt="advertiser" className="w-5 h-5 rounded-full" />
          <span className="font-medium text-gray-500">{ad.advertiser}</span>
        </div>
        <span className="text-[10px] text-gray-300">Sponsored</span>
      </div>
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
            {displayPosts.map((post, index) => {
               const isAdmin = post.authorId === 'momple' || post.authorName === 'momple' || post.authorId === 'admin_master';
               const showAd = activeTab !== 'notice' && index > 0 && index % 3 === 0;
               return (
               <React.Fragment key={post.id}>
                  {showAd && <NativeAdPlaceholder index={Math.floor(index / 3)} />}
                  <div onClick={() => navigate(`/post/${post.id}`)} className={`p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${post.isNotice ? 'bg-teal-50/50 border-teal-100' : 'bg-white border-gray-100'}`}>
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
               </React.Fragment>
            )})}
         </div>
      </div>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-40">
        <button onClick={() => navigate('/write')} className="absolute bottom-0 right-4 bg-[#2AC1BC] text-white p-4 rounded-full shadow-lg hover:bg-[#209692] transition-colors pointer-events-auto"><PenSquare size={24} /></button>
      </div>
    </div>
  );
};

const MegaphoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const DollarSignIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const MyPage = ({ user, posts, onLogout, onUpdateUser }: { user: UserState, posts: CommunityPost[], onLogout: () => void, onUpdateUser: (updates: Partial<UserState>) => void }) => {
    const navigate = useNavigate();
    const [myPageView, setMyPageView] = useState<'main' | 'my-posts' | 'notices' | 'support'>('main');
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [editIntro, setEditIntro] = useState(user.intro || '');
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [editNickname, setEditNickname] = useState(user.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [supportType, setSupportType] = useState<'general' | 'bug' | 'suggest'>('general');
    const [supportContent, setSupportContent] = useState('');

    // 닉네임 변경 가능 여부 (월 1회)
    const canChangeNickname = () => {
      if (!user.lastNicknameChangeDate) return true;
      const lastChange = new Date(user.lastNicknameChangeDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 30;
    };
    const daysUntilNicknameChange = () => {
      if (!user.lastNicknameChangeDate) return 0;
      const lastChange = new Date(user.lastNicknameChangeDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, 30 - diffDays);
    };

    const handleSaveNickname = () => {
      if (!editNickname.trim()) { alert('닉네임을 입력해주세요.'); return; }
      if (editNickname.trim().length < 2) { alert('닉네임은 2자 이상이어야 합니다.'); return; }
      if (!canChangeNickname()) { alert(`닉네임은 한 달에 한 번만 변경 가능합니다.\n${daysUntilNicknameChange()}일 후에 변경할 수 있습니다.`); return; }
      onUpdateUser({ name: editNickname.trim(), lastNicknameChangeDate: new Date().toISOString() });
      setIsEditingNickname(false);
    };

    const handleSaveIntro = () => {
      onUpdateUser({ intro: editIntro.trim() });
      setIsEditingIntro(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const imageUrl = URL.createObjectURL(e.target.files[0]);
        onUpdateUser({ avatar: imageUrl });
      }
    };

    // --- 서브뷰: 내가 작성한 글 ---
    if (myPageView === 'my-posts') {
      const myPosts = posts.filter(p => p.authorId === 'me' || p.authorName === user.name);
      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
            <button onClick={() => setMyPageView('main')} className="text-gray-800"><ArrowLeft size={22} /></button>
            <h1 className="font-bold text-lg">내가 작성한 글</h1>
          </div>
          {myPosts.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">작성한 글이 없습니다.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {myPosts.map(post => (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-800 truncate mb-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{post.timeAgo}</span>
                    <span>조회 {post.viewCount}</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // --- 서브뷰: 공지사항 ---
    if (myPageView === 'notices') {
      const notices = posts.filter(p => p.isNotice);
      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
            <button onClick={() => setMyPageView('main')} className="text-gray-800"><ArrowLeft size={22} /></button>
            <h1 className="font-bold text-lg">공지사항</h1>
          </div>
          {notices.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notices.map(post => (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">공지</span>
                    <span className="text-xs text-gray-400">{post.timeAgo}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // --- 서브뷰: 고객센터 문의하기 ---
    if (myPageView === 'support') {
      const typeLabels = { general: '일반 문의', bug: '버그 신고', suggest: '개선 건의' };
      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
            <button onClick={() => setMyPageView('main')} className="text-gray-800"><ArrowLeft size={22} /></button>
            <h1 className="font-bold text-lg">고객센터 문의하기</h1>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">문의 유형</label>
              <div className="flex gap-2">
                {(['general', 'bug', 'suggest'] as const).map(t => (
                  <button key={t} onClick={() => setSupportType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${supportType === t ? 'bg-[#2AC1BC] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">문의 내용</label>
              <textarea
                value={supportContent}
                onChange={(e) => setSupportContent(e.target.value)}
                placeholder="문의하실 내용을 자세히 적어주세요."
                className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-[#2AC1BC] min-h-[180px] resize-none transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (!supportContent.trim()) { alert('문의 내용을 입력해주세요.'); return; }
                alert('문의가 접수되었습니다.\n빠른 시일 내에 답변드리겠습니다.');
                setSupportContent('');
                setMyPageView('main');
              }}
              className="w-full bg-[#2AC1BC] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#209692] transition-colors"
            >
              문의 접수하기
            </button>
          </div>
        </div>
      );
    }

    // --- 메인 뷰 ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 프로필 헤더 */}
            <div className="bg-white p-5 mb-2">
                <div className="flex items-center gap-4 mb-4">
                    {/* 프로필 사진 (변경 가능) */}
                    <label className="relative cursor-pointer group shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=2AC1BC&color=fff`} alt="profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                        <Camera size={18} className="text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#2AC1BC] rounded-full flex items-center justify-center border-2 border-white">
                        <Camera size={10} className="text-white" />
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                    <div className="flex-1 min-w-0">
                        {/* 닉네임 (수정 가능) */}
                        {isEditingNickname ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} className="font-bold text-lg text-gray-900 border-b-2 border-[#2AC1BC] outline-none bg-transparent w-full" autoFocus maxLength={12} />
                            <button onClick={handleSaveNickname} className="text-[#2AC1BC] shrink-0"><Check size={20} /></button>
                            <button onClick={() => { setIsEditingNickname(false); setEditNickname(user.name); }} className="text-gray-400 shrink-0"><X size={20} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-lg text-gray-900 truncate">{user.name}</h2>
                            <button onClick={() => { if (canChangeNickname()) { setIsEditingNickname(true); } else { alert(`닉네임은 한 달에 한 번만 변경 가능합니다.\n${daysUntilNicknameChange()}일 후에 변경할 수 있습니다.`); }}} className="text-gray-400 hover:text-[#2AC1BC] shrink-0"><Edit2 size={14} /></button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{user.email || ''}</p>
                        <span className="inline-block text-[10px] text-[#2AC1BC] bg-[#2AC1BC]/10 px-2 py-0.5 rounded-full mt-1 font-medium">{user.role === 'provider' ? '파트너스 회원' : user.role === 'admin' ? '관리자' : '일반 회원'}</span>
                    </div>
                    <button onClick={onLogout} className="text-gray-400 hover:text-red-500 shrink-0 self-start mt-1"><LogOut size={20} /></button>
                </div>

                {/* 상태메세지 */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  {isEditingIntro ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editIntro} onChange={(e) => setEditIntro(e.target.value)} placeholder="상태메세지를 입력하세요" className="flex-1 text-sm bg-transparent outline-none text-gray-700" autoFocus maxLength={50} />
                      <button onClick={handleSaveIntro} className="text-[#2AC1BC] shrink-0"><Check size={18} /></button>
                      <button onClick={() => { setIsEditingIntro(false); setEditIntro(user.intro || ''); }} className="text-gray-400 shrink-0"><X size={18} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditingIntro(true)} className="w-full text-left flex items-center justify-between">
                      <span className={`text-sm ${user.intro ? 'text-gray-600' : 'text-gray-400'}`}>{user.intro || '상태메세지를 입력해보세요'}</span>
                      <Edit2 size={14} className="text-gray-400 shrink-0" />
                    </button>
                  )}
                </div>

                {/* 활동 통계 */}
                <div className="flex justify-around py-2">
                    <div className="text-center">
                      <span className="font-bold text-base text-gray-900">{user.postCount}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">게시글</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                      <span className="font-bold text-base text-gray-900">{user.commentCount}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">댓글</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                      <span className="font-bold text-base text-gray-900">{user.followerCount}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">팔로워</p>
                    </div>
                </div>
            </div>

            {/* 나의 활동 */}
            <div className="bg-white mb-2">
              <h3 className="font-bold text-gray-800 text-sm px-5 pt-4 pb-2">나의 활동</h3>
              <ul>
                <li onClick={() => setMyPageView('my-posts')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><FileText size={18} className="text-gray-400" /><span className="text-sm text-gray-700">내가 작성한 글</span></div>
                  <ChevronRight size={16} className="text-gray-300" />
                </li>
                {user.role === 'provider' && (
                  <li onClick={() => navigate('/provider-edit')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3"><Settings size={18} className="text-gray-400" /><span className="text-sm text-gray-700">업체 정보 관리</span></div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </li>
                )}
              </ul>
            </div>

            {/* 파트너스 비즈니스 관리 (기존 유지) */}
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

            {/* 고객센터 */}
            <div className="bg-white mb-2">
              <h3 className="font-bold text-gray-800 text-sm px-5 pt-4 pb-2">고객센터</h3>
              <ul>
                <li onClick={() => setMyPageView('notices')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Megaphone size={18} className="text-gray-400" /><span className="text-sm text-gray-700">공지사항</span></div>
                  <ChevronRight size={16} className="text-gray-300" />
                </li>
                <li onClick={() => setMyPageView('support')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Headphones size={18} className="text-gray-400" /><span className="text-sm text-gray-700">고객센터 문의하기</span></div>
                  <ChevronRight size={16} className="text-gray-300" />
                </li>
                {user.role === 'admin' && (
                  <li onClick={() => navigate('/admin')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3"><Settings size={18} className="text-gray-400" /><span className="text-sm text-gray-700">관리자 센터</span></div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </li>
                )}
              </ul>
            </div>

            {/* 기타 */}
            <div className="bg-white mb-2">
              <ul>
                <li onClick={() => navigate('/debug')} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Settings size={18} className="text-gray-400" /><span className="text-sm text-gray-700">앱 정보</span></div>
                  <ChevronRight size={16} className="text-gray-300" />
                </li>
              </ul>
            </div>

            {/* 회원탈퇴 */}
            <div className="px-5 py-4 text-center">
              <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-gray-400 hover:text-red-400 transition-colors underline underline-offset-4">
                회원탈퇴
              </button>
            </div>

            {/* 회원탈퇴 확인 모달 */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
                <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle size={28} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">회원탈퇴</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">정말 탈퇴하시겠습니까?<br/>탈퇴 시 모든 데이터가 삭제되며<br/>복구할 수 없습니다.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">취소</button>
                    <button onClick={() => { setShowDeleteConfirm(false); onLogout(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">탈퇴하기</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

function App() {
  const [user, setUser] = useState<UserState | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  
  // Google 리다이렉트 로그인 결과 처리
  useEffect(() => {
    handleGoogleRedirect().then(result => {
      if (result && result.success && result.user) {
        handleLoginSuccess(result.user);
      }
    });
  }, []);

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

  const handleUpdateUser = (updates: Partial<UserState>) => {
    if (user) setUser({ ...user, ...updates });
  };

  // 금칙어 필터링
  const containsForbiddenWords = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      if (lower.includes(word.toLowerCase())) return word;
    }
    return null;
  };

  const handleWritePost = (title: string, content: string, imageUrl?: string, isNotice: boolean = false) => {
     // 금칙어 체크
     const forbiddenInTitle = containsForbiddenWords(title);
     const forbiddenInContent = containsForbiddenWords(content);
     if (forbiddenInTitle || forbiddenInContent) {
       alert(`금칙어가 포함되어 있습니다: "${forbiddenInTitle || forbiddenInContent}"\n게시글을 수정해주세요.`);
       return;
     }

     const newPost: CommunityPost = {
         id: `new_${Date.now()}`,
         title,
         content,
         imageUrl,
         authorId: user?.role === 'admin' ? 'admin_master' : 'me',
         authorName: user?.name || '익명',
         authorBadge: user?.role === 'admin' ? '관리자' : '새내기',
         timeAgo: '방금 전',
         viewCount: 0,
         likeCount: 0,
         commentCount: 0,
         isPopular: false,
         isNotice: isNotice,
         comments: []
     };
     setPosts([newPost, ...posts]);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
    // 금칙어 체크
    const forbidden = containsForbiddenWords(content);
    if (forbidden) {
      alert(`금칙어가 포함되어 있습니다: "${forbidden}"`);
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: `cmt_${Date.now()}`,
          authorName: user?.name || '익명',
          content,
          timeAgo: '방금 전',
          likeCount: 0,
          isAdmin: user?.role === 'admin'
        };
        return {
          ...p,
          commentCount: p.commentCount + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));
  };

  const handleReportPost = (postId: string) => {
    if (window.confirm('이 게시글을 신고하시겠습니까?')) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) return { ...p, isReported: true };
        return p;
      }));
      alert('신고가 접수되었습니다. 관리자가 검토 후 조치합니다.');
    }
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
                 <Route path="/momchin" element={<MomchinPage userState={user} onToggleFollow={() => {}} onUpdateProfile={handleUpdateUser} />} />
                 <Route path="/chat" element={<ChatListPage />} />
                 <Route path="/chat/:id" element={<ChatRoomPage userState={user} />} />
                 <Route path="/my" element={<MyPage user={user} posts={posts} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
                 <Route path="/provider/:id" element={<ProviderDetailPage onWriteReview={() => {}} />} />
                 <Route path="/post/:id" element={<PostDetailPage posts={posts} userState={user} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onReportPost={handleReportPost} />} />
                 <Route path="/notifications" element={<NotificationPage />} />
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
