import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home, MessageCircle, User, MapPin, Search, Send, Sparkles, LogOut, FileText, Camera, CheckCircle, Upload, ChevronRight, Settings, MessageSquareText, Users, Coins, Megaphone, Gift, CreditCard, Plus, X, Edit3, Smile, Bell, Eye, ThumbsUp, ArrowLeft, MoreHorizontal, Share2, Siren, AlertCircle, Heart, UserPlus, UserCheck, Calendar, Mail, Lock, UserX } from 'lucide-react';

// Components & Data
import ProviderCard from './components/ProviderCard';
import ProviderDetailPage from './components/ProviderDetailPage';
import { ChatListPage, ChatRoomPage } from './components/ChatPages';
import MomchinPage from './components/MomchinPage';
import { ProviderEditPage, ProviderAdsPage, ProviderPointsPage, ProviderReviewsPage } from './components/ProviderBusinessPages';
import ProviderSchedulePage from './components/ProviderSchedulePage';
import { MOCK_PROVIDERS, MOCK_PRODUCTS, MOCK_COMMUNITY_POSTS, MOCK_NOTIFICATIONS } from './constants';
import { Provider, UserState, Product, UserRole, CommunityPost, QualityGrade, Comment, Schedule, Review } from './types';
import { verifyBusinessNumber } from './services/externalApi';
// Import new Auth Service
import { loginWithGoogle, loginWithKakao, loginWithEmail, signUpWithEmail, initKakao, AuthResult, handleGoogleRedirect } from './services/authService';

// --- Auth & Onboarding Components ---

const LaunchScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800 relative overflow-hidden animate-fade-in-up">
    <div className="z-10 flex flex-col items-center">
      {/* Icon removed */}
      <h1 className="text-4xl font-bold mb-3 tracking-tight text-primary">Momple</h1>
      <p className="text-gray-400 text-sm font-medium mb-12">엄마를 위한 모든 케어, 맘플</p>
      
      <button 
        onClick={onStart}
        className="bg-primary text-white font-bold py-4 px-12 rounded-full shadow-lg hover:bg-primary-dark transition-all active:scale-95 w-64"
      >
        시작하기
      </button>
    </div>
  </div>
);

const SocialButton = ({ icon, text, bg, color, border, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 relative shadow-sm transition-transform active:scale-[0.98] ${bg} ${color} ${border}`}
  >
    {icon && <div className="absolute left-4">{icon}</div>}
    {text}
  </button>
);

const AuthSelection = ({ onLoginSuccess }: { onLoginSuccess: (user?: any) => void }) => {
  const [view, setView] = useState<'social' | 'email_login' | 'email_signup'>('social');
  const [emailForm, setEmailForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  
  // Admin Login State
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    // Initialize Kakao SDK
    initKakao();

    // Check for Google Redirect Result (Mobile Auth)
    const checkRedirect = async () => {
        setLoading(true);
        const result = await handleGoogleRedirect();
        if (result) {
            if (result.success) {
                onLoginSuccess(result.user);
            } else {
                alert(`로그인 확인 중 오류: ${result.error}`);
            }
        }
        setLoading(false);
    };
    checkRedirect();
  }, []);
  
  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
      setLoading(true);
      let result: AuthResult | undefined;
      
      try {
        if (provider === 'google') {
          // Google uses Redirect method now
          result = await loginWithGoogle();
          if (result.isRedirect) {
              // Redirecting... do nothing
              return;
          }
        } else if (provider === 'kakao') {
          // Kakao Login
          const timeoutPromise = new Promise<AuthResult>((resolve) => {
             setTimeout(() => resolve({ success: false, error: "응답 시간이 초과되었습니다. 팝업 차단 여부를 확인하거나 카카오 도메인 설정을 확인해주세요." }), 10000);
          });
          
          result = await Promise.race([loginWithKakao(), timeoutPromise]);
        }
      } catch (e: any) {
        result = { success: false, error: e.message || "로그인 중 오류가 발생했습니다." };
      }
      
      setLoading(false);

      if (result && result.success) {
          onLoginSuccess(result.user);
      } else {
          // Explicit Error Handling for User
          if (result?.error) {
              alert(`로그인 실패\n\n${result.error}`);
          }
      }
  };

  const handleAdminLoginSubmit = () => {
    // Check password (trimmed for safety)
    if (adminPassword.trim() === "Dkdlfltm1!") {
        const adminUser = {
            uid: 'admin_user',
            email: 'admin@momple.com',
            displayName: '관리자',
            photoURL: null,
            isAdmin: true // Special flag for immediate login
        };
        alert("관리자 권한으로 접속되었습니다.");
        onLoginSuccess(adminUser);
    } else {
        alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleEmailAuth = async () => {
    if (!emailForm.email || !emailForm.password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    let result;

    if (view === 'email_signup') {
       if (!emailForm.name) {
         alert('이름을 입력해주세요.');
         setLoading(false);
         return;
       }
       result = await signUpWithEmail(emailForm.email, emailForm.password, emailForm.name);
    } else {
       result = await loginWithEmail(emailForm.email, emailForm.password);
    }

    setLoading(false);

    if (result.success) {
      // alert(view === 'email_signup' ? '회원가입 성공!' : '로그인 성공!');
      onLoginSuccess(result.user);
    } else {
      alert(result.error);
    }
  };

  if (view === 'social') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-end pb-12 animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-primary mb-2">환영합니다!</h2>
          <p className="text-gray-400 text-center text-sm">클린한 육아 커뮤니티<br/>맘플과 함께하세요.</p>
        </div>
        
        {loading ? (
           <div className="flex flex-col justify-center items-center py-10 space-y-4">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
             <p className="text-sm text-gray-500">로그인 정보를 확인 중입니다...</p>
             <button 
               onClick={() => setLoading(false)} 
               className="text-xs text-gray-400 underline hover:text-gray-600"
             >
               취소하기
             </button>
           </div>
        ) : (
          <div className="space-y-3">
            <SocialButton 
              onClick={() => handleSocialLogin('kakao')}
              bg="bg-[#FEE500]" 
              color="text-[#000000]" 
              text="카카오톡으로 시작하기"
              icon={<MessageCircle size={20} fill="currentColor" className="text-black" />}
            />
            
            <SocialButton 
              onClick={() => handleSocialLogin('google')}
              bg="bg-white" 
              color="text-gray-700" 
              border="border border-gray-200"
              text="Google로 계속하기"
              icon={<span className="font-bold text-lg">G</span>}
            />
            
            {!showAdminInput ? (
                <button 
                    onClick={() => setShowAdminInput(true)}
                    className="w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 relative bg-gray-800 text-white hover:bg-gray-900 transition-colors shadow-md active:scale-[0.98]"
                >
                    <div className="absolute left-4"><Lock size={20} /></div>
                    관리자 로그인
                </button>
            ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                    <p className="text-xs font-bold text-gray-500 mb-2">관리자 비밀번호 입력</p>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-800"
                            placeholder="비밀번호"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLoginSubmit()}
                            autoFocus
                        />
                        <button 
                            onClick={handleAdminLoginSubmit}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap active:bg-black"
                        >
                            접속
                        </button>
                    </div>
                    <button 
                        onClick={() => { setShowAdminInput(false); setAdminPassword(''); }}
                        className="text-xs text-gray-400 mt-2 underline"
                    >
                        취소
                    </button>
                </div>
            )}
            
            <div className="text-center mt-4 flex justify-center gap-4">
              <button onClick={() => setView('email_login')} className="text-xs text-gray-400 underline">
                이메일 로그인
              </button>
              <button onClick={() => setView('email_signup')} className="text-xs text-gray-400 underline">
                이메일 회원가입
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Email Login/Signup View
  return (
    <div className="min-h-screen bg-white p-6 pt-12 animate-fade-in">
       <button onClick={() => setView('social')} className="mb-8 text-gray-800"><ArrowLeft /></button>
       <h2 className="text-2xl font-bold text-gray-900 mb-2">
         {view === 'email_signup' ? '이메일로 회원가입' : '이메일 로그인'}
       </h2>
       <p className="text-gray-400 text-sm mb-8">
         {view === 'email_signup' ? '맘플의 모든 서비스를 이용해보세요.' : '반가워요! 다시 오셨군요.'}
       </p>

       <div className="space-y-4">
          {view === 'email_signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">이름/닉네임</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
                <User size={18} className="text-gray-300 mr-2" />
                <input 
                  type="text" 
                  value={emailForm.name}
                  onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                  className="flex-1 outline-none text-sm" 
                  placeholder="맘플맘"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">이메일</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
              <Mail size={18} className="text-gray-300 mr-2" />
              <input 
                type="email" 
                value={emailForm.email}
                onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                className="flex-1 outline-none text-sm" 
                placeholder="example@momple.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">비밀번호</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
              <Lock size={18} className="text-gray-300 mr-2" />
              <input 
                type="password" 
                value={emailForm.password}
                onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                className="flex-1 outline-none text-sm" 
                placeholder="6자리 이상 입력"
              />
            </div>
          </div>

          <button 
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (view === 'email_signup' ? '가입하기' : '로그인')}
          </button>
       </div>
    </div>
  );
};

const RoleSelection = ({ onSelectRole }: { onSelectRole: (role: UserRole) => void }) => (
  <div className="min-h-screen bg-white p-6 pt-12">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">어떤 분이신가요?</h2>
    <p className="text-gray-400 text-sm mb-8">서비스 이용 목적을 선택해주세요.</p>
    
    <div className="space-y-4">
      <button 
        onClick={() => onSelectRole('user')}
        className="w-full p-6 bg-white border border-gray-200 rounded-2xl flex items-center gap-4 hover:border-primary hover:bg-teal-50/30 transition-all group text-left shadow-sm hover:shadow-md"
      >
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👩‍🍼</div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">일반회원</h3>
          <p className="text-sm text-gray-400">산후도우미 찾기</p>
        </div>
        <ChevronRight className="ml-auto text-gray-300 group-hover:text-primary" />
      </button>

      <button 
        onClick={() => onSelectRole('provider')}
        className="w-full p-6 bg-white border border-gray-200 rounded-2xl flex items-center gap-4 hover:border-secondary hover:bg-blue-50/30 transition-all group text-left shadow-sm hover:shadow-md"
      >
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏥</div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">파트너스</h3>
          <p className="text-sm text-gray-400">업체 홍보, 예약 관리, 광고 집행</p>
        </div>
        <ChevronRight className="ml-auto text-gray-300 group-hover:text-secondary" />
      </button>
    </div>
  </div>
);

const ProviderSignUp = ({ onComplete }: { onComplete: (info: any) => void }) => {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({
    businessName: '',
    businessRegNo: '',
    file: null as File | null
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInfo({ ...info, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!info.businessName || !info.businessRegNo || !info.file) {
      alert("모든 정보를 입력하고 사업자등록증을 업로드해주세요.");
      return;
    }
    
    setIsVerifying(true);
    
    // Call the external API service
    const isValid = await verifyBusinessNumber(info.businessRegNo);
    
    setIsVerifying(false);

    if (isValid) {
        onComplete(info);
    } else {
        alert("유효하지 않은 사업자 번호입니다. 다시 확인해주세요.\n(데모: 10자리 숫자 입력)");
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">사업자 정보를 확인 중입니다...</h3>
        <p className="text-gray-400 text-center text-sm">국세청 API를 통해 정보를 대조하고 있습니다.<br/>잠시만 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pt-8 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
        <div className="h-0.5 flex-1 bg-gray-100"></div>
        <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">2</div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">업체 비즈니스 가입</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">업체명 (상호)</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="예: 맘플 산후조리"
            value={info.businessName}
            onChange={(e) => setInfo({...info, businessName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">사업자등록번호</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="000-00-00000"
            value={info.businessRegNo}
            onChange={(e) => setInfo({...info, businessRegNo: e.target.value})}
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">사업자등록증 첨부</label>
           <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${info.file ? 'border-primary bg-teal-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
             {info.file ? (
               <div className="flex flex-col items-center">
                 <CheckCircle className="text-primary mb-2" size={32} />
                 <p className="text-sm font-bold text-primary">{info.file.name}</p>
                 <button onClick={() => setInfo({...info, file: null})} className="text-xs text-gray-400 mt-2 underline">다시 올리기</button>
               </div>
             ) : (
               <label className="cursor-pointer block">
                 <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                 <p className="text-sm text-gray-500 font-medium">터치하여 파일 업로드</p>
                 <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF 가능</p>
                 <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
               </label>
             )}
           </div>
           <p className="text-xs text-gray-400 mt-2">* 허위 정보 등록 시 서비스 이용이 제한될 수 있습니다.</p>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary-dark transition-colors mt-8"
        >
          인증 요청 및 가입하기
        </button>
      </div>
    </div>
  );
};

// ... (Other Page Components like PostSearchPage, HomePage, ProviderSearchPage, MyPage, etc. remain the same) ...
const PostSearchPage = ({ posts }: { posts: CommunityPost[] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredPosts = query.trim() === '' 
    ? [] 
    : posts.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.content.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
           <input 
             type="text" 
             placeholder="궁금한 이야기를 검색해보세요" 
             className="bg-transparent flex-1 outline-none text-sm placeholder-gray-400"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             autoFocus
           />
           {query && (
             <button onClick={() => setQuery('')}>
               <X size={16} className="text-gray-400" />
             </button>
           )}
        </div>
        <Search size={24} className="text-gray-800" />
      </div>

      <div className="p-4">
        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-300">
             <Search size={48} className="mb-4 opacity-20" />
             <p className="text-sm">검색어를 입력해주세요.</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="block cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${post.isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                        {post.isPopular ? '🔥 인기' : '일상'}
                    </span>
                    <span className="text-xs text-gray-400">{post.timeAgo}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                   <span>{post.authorName}</span>
                   <div className="flex gap-2 ml-auto">
                       <span>조회 {post.viewCount}</span>
                       <span>좋아요 {post.likeCount}</span>
                       <span>댓글 {post.commentCount}</span>
                   </div>
                </div>
                <hr className="border-gray-50 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-300">
             <AlertCircle size={48} className="mb-4 opacity-20" />
             <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage = ({ userState, posts, setPosts }: { userState: UserState, posts: CommunityPost[], setPosts: any }) => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 flex justify-between items-center shadow-sm border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary">Momple</h1>
        <div className="flex gap-4 text-gray-600">
           <Search size={24} onClick={() => navigate('/search-posts')} />
           <Bell size={24} onClick={() => navigate('/notifications')} />
        </div>
      </div>

      {/* Community Content Only */}
      <div className="p-4">
         <div className="mb-4 flex justify-between items-center">
             <h2 className="font-bold text-lg text-gray-800">커뮤니티</h2>
             <button className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-primary-dark transition-colors">
                 <Edit3 size={12} /> 글쓰기
             </button>
         </div>
         
         <div className="space-y-3">
           {posts.map(post => (
             <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">
                {post.isBlinded ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                            <AlertCircle size={16} />
                            <span className="font-bold text-sm">삭제된 게시글</span>
                        </div>
                        <p className="text-xs text-gray-300">신고에 의해 블라인드 처리되었습니다.</p>
                    </div>
                ) : (
                    <>
                        {/* Top Row: Label, Author, Time */}
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${post.isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                {post.isPopular ? '🔥 인기' : '일상'}
                            </span>
                            <span className="font-bold text-xs text-gray-800">{post.authorName}</span>
                            <span className="text-xs text-gray-300">· {post.timeAgo}</span>
                        </div>

                        {/* Middle: Title & Content */}
                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">{post.content}</p>
                        
                        {/* Bottom: Badge & Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
                            <span>{post.authorBadge}</span>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-0.5"><Eye size={12} /> {post.viewCount}</span>
                                <span className="flex items-center gap-0.5"><ThumbsUp size={12} /> {post.likeCount}</span>
                                <span className="flex items-center gap-0.5"><MessageSquareText size={12} /> {post.commentCount}</span>
                            </div>
                        </div>
                    </>
                )}
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

const ProviderSearchPage = ({ userState }: { userState: UserState }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-20">
       <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3">
             <Search size={20} className="text-gray-400 mr-2" />
             <input type="text" placeholder="지역, 산후도우미 업체 검색" className="bg-transparent flex-1 outline-none text-sm" />
          </div>
       </div>
       <div className="p-4">
          <h2 className="font-bold text-lg mb-4">산후도우미 리스트</h2>
          {MOCK_PROVIDERS.map((p) => (
             <ProviderCard 
                 key={p.id} 
                 provider={p} 
                 onViewReviews={() => navigate(`/provider/${p.id}`)}
                 onBook={() => {}}
               />
          ))}
       </div>
    </div>
  );
};

const MyPage = ({ userState, setUserState, onLogout }: any) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-6 mb-2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl overflow-hidden border border-gray-100">
                        {userState.avatar ? (
                            <img src={userState.avatar} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>👩‍🍼</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-bold text-xl text-gray-900">{userState.name}</h2>
                            <div className="flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 font-medium">
                                <Users size={10} />
                                <span>{userState.followerCount}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">새내기맘 · 포인트 {userState.points.toLocaleString()}P</p>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                        <Settings size={20} />
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/my/posts')} className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                        <FileText size={18} /> 내가 쓴 글
                    </button>
                    <button className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                        <Heart size={18} /> 찜한 목록
                    </button>
                    <button className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                         <CreditCard size={18} /> 결제 내역
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="font-medium text-gray-700">공지사항</span>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="font-medium text-gray-700">고객센터</span>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
                 <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={onLogout}>
                    <span className="font-medium text-red-500">로그아웃</span>
                    <LogOut size={18} className="text-red-300" />
                </div>
            </div>
        </div>
    );
};

const MyPostsPage = ({ posts, userState }: { posts: CommunityPost[], userState: UserState }) => {
    const navigate = useNavigate();
    const myPosts = posts.filter(p => p.authorName === userState.name || p.authorName === '새내기맘'); // Mock check
    
    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1 className="font-bold text-lg">내가 쓴 글</h1>
            </div>
            <div className="p-4 space-y-3">
                {myPosts.length > 0 ? myPosts.map(post => (
                    <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="py-3 border-b border-gray-100 last:border-0">
                        <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                             <span>{post.timeAgo}</span>
                             <span>조회 {post.viewCount}</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-400">작성한 글이 없습니다.</div>
                )}
            </div>
        </div>
    );
};

const PostDetailPage = ({ posts, userState, onToggleFollow }: { posts: CommunityPost[], userState: UserState, onToggleFollow: (id: string) => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const post = posts.find(p => p.id === id);
    const [showProfileModal, setShowProfileModal] = useState(false);

    if (!post) return <div>Post not found</div>;

    const isMyPost = post.authorName === userState.name;
    const isFollowing = userState.following.includes(post.authorId);

    const handleStartChat = () => {
        // Navigate to chat with new request state
        const chatId = `new_dm_${post.authorId}`;
        navigate(`/chat/${chatId}`, {
            state: {
                isNewRequest: true,
                targetId: post.authorId,
                targetName: post.authorName,
                targetImage: 'https://picsum.photos/50/50', // Mock image
            }
        });
        setShowProfileModal(false);
    };

    return (
        <div className="min-h-screen bg-white pb-20 relative">
             <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <div className="flex gap-4 text-gray-600">
                    <Share2 size={22} />
                    <MoreHorizontal size={22} />
                </div>
            </div>
            
            <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${post.isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                        {post.isPopular ? '🔥 인기' : '일상'}
                    </span>
                    <h1 className="text-lg font-bold text-gray-900 flex-1">{post.title}</h1>
                </div>
                
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                    <div 
                        onClick={() => setShowProfileModal(true)}
                        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        👤
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div 
                                onClick={() => setShowProfileModal(true)}
                                className="font-bold text-gray-700 text-sm cursor-pointer hover:underline"
                            >
                                {post.authorName}
                                {post.authorFollowerCount !== undefined && (
                                   <span className="text-gray-400 font-normal ml-1 text-xs">
                                     (팔로워 {post.authorFollowerCount})
                                   </span>
                                )}
                            </div>
                            {!isMyPost && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFollow(post.authorId);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-0.5 ${
                                    isFollowing
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                    : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserCheck size={9} /> 팔로잉
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={9} /> 팔로우
                                    </>
                                )}
                            </button>
                            )}
                        </div>
                        <div className="text-xs text-gray-400">{post.timeAgo} · 조회 {post.viewCount}</div>
                    </div>
                </div>

                <div className="text-gray-800 text-sm leading-relaxed mb-6 min-h-[100px] whitespace-pre-wrap">
                    {post.content}
                </div>
                
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="post" className="w-full rounded-xl mb-6" />
                )}

                <div className="flex items-center gap-4 py-4 border-t border-gray-100 text-gray-500 text-sm font-medium">
                     <button className="flex items-center gap-1 hover:text-red-500"><ThumbsUp size={18} /> {post.likeCount}</button>
                     <button className="flex items-center gap-1 hover:text-blue-500"><MessageSquareText size={18} /> {post.commentCount}</button>
                </div>
            </div>

            {/* Comments Area (Mock) */}
            <div className="bg-gray-50 p-4 min-h-[200px]">
                <h3 className="text-sm font-bold text-gray-700 mb-3">댓글 {post.commentCount}</h3>
                <div className="space-y-3">
                    {/* Mock Comment */}
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs">육아고수</span>
                            <span className="text-[10px] text-gray-400">10분 전</span>
                        </div>
                        <p className="text-xs text-gray-600">저도 그맘 알죠 ㅠㅠ 힘내세요!</p>
                    </div>
                </div>
            </div>

            {/* Input Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 pb-safe z-10 max-w-md mx-auto right-0">
                <div className="flex gap-2">
                    <input type="text" placeholder="댓글을 입력하세요." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
                    <button className="p-2 text-primary"><Send size={20} /></button>
                </div>
            </div>

            {/* Profile/DM Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                        <button 
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-3">
                                👤
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{post.authorName}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-4">
                                {post.authorBadge || '새내기맘'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200">
                                <User size={18} /> 프로필 보기
                            </button>
                            {!isMyPost ? (
                                <button 
                                    onClick={handleStartChat}
                                    className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark shadow-md"
                                >
                                    <MessageCircle size={18} /> 1:1 대화 신청
                                </button>
                            ) : (
                                <button disabled className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold cursor-not-allowed">
                                    나와의 채팅
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NotificationPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">알림</h1>
      </div>
      <div className="divide-y divide-gray-50">
        {MOCK_NOTIFICATIONS.map(note => (
          <div key={note.id} className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors ${!note.isRead ? 'bg-blue-50/30' : ''}`} onClick={() => note.targetPath && navigate(note.targetPath)}>
             <div className="mt-1">
               {note.type === 'like' && <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><Heart size={16} fill="currentColor" /></div>}
               {note.type === 'comment' && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><MessageCircle size={16} fill="currentColor" /></div>}
               {note.type === 'notice' && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"><Megaphone size={16} /></div>}
             </div>
             <div className="flex-1">
               <p className="text-sm text-gray-800 mb-1 leading-snug">{note.content}</p>
               <span className="text-xs text-gray-400">{note.timeAgo}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProviderBusinessCenter = ({ userState }: { userState: UserState }) => {
    const navigate = useNavigate();

    // Logic to construct the provider object for the card preview
    // 1. Try to find existing mock data for detailed stats (reviews, grade, etc.)
    const providerId = userState.providerInfo?.id;
    const mockProvider = MOCK_PROVIDERS.find(p => p.id === providerId);

    // 2. Merge with userState.providerInfo which contains editable fields (description, image, phone)
    // If no mock found (new user), use defaults.
    const myProvider: Provider | null = userState.providerInfo ? {
        ...(mockProvider || {
            id: userState.providerInfo.id || 'temp',
            location: '지역 정보 없음', // In real app, from user profile
            grade: QualityGrade.Unrated,
            yearsActive: 0,
            isVerified: false,
            isAd: false,
            reviews: [],
            priceStart: 0
        }),
        // Overwrite editable fields from local state
        name: userState.providerInfo.businessName,
        description: userState.providerInfo.description || mockProvider?.description || '',
        imageUrl: userState.providerInfo.imageUrl || mockProvider?.imageUrl || '',
        phoneNumber: userState.providerInfo.phoneNumber || mockProvider?.phoneNumber,
    } : null;

    // Provider Dashboard
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-6 shadow-sm mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">파트너스 센터</h1>
                <p className="text-sm text-gray-500">{userState.providerInfo?.businessName}님, 환영합니다.</p>
            </div>
            
            {/* NEW: Provider Card Preview */}
            {myProvider && (
                <div className="px-4 mb-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                         <h3 className="font-bold text-gray-700 text-sm">내 업체 카드 미리보기</h3>
                         <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">고객에게 보이는 화면</span>
                    </div>
                    <div className="pointer-events-auto"> 
                         <ProviderCard 
                            provider={myProvider}
                            onViewReviews={() => navigate(`/provider/${myProvider.id}`)}
                            onBook={() => {}}
                         />
                    </div>
                </div>
            )}

            <div className="p-4 grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">오늘 방문</div>
                    <div className="text-2xl font-bold text-gray-900">124</div>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">신규 예약 문의</div>
                    <div className="text-2xl font-bold text-primary">3</div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div 
                  onClick={() => navigate('/provider/edit')}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Edit3 size={20} /></div>
                        <span className="font-bold text-gray-700">업체 정보 수정</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
                 <div 
                   onClick={() => navigate('/provider/ads')}
                   className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Megaphone size={20} /></div>
                        <span className="font-bold text-gray-700">광고 관리</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
                 {/* New Review Management Link */}
                 <div 
                   onClick={() => navigate('/provider/reviews')}
                   className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><MessageSquareText size={20} /></div>
                        <span className="font-bold text-gray-700">후기 관리</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
                 <div 
                   onClick={() => navigate('/provider/points')}
                   className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><Coins size={20} /></div>
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-700">포인트 충전</span>
                           <span className="text-xs text-gray-400">보유: {userState.points.toLocaleString()} P</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
            </div>
        </div>
    );
};

// --- UPDATED NAVIGATION COMPONENTS ---

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Make icons thinner (1.75) when inactive, normal (1.25) when active
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 relative p-2 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
      {isActive && <div className="absolute top-1 w-1 h-1 bg-primary rounded-full"></div>}
      <Icon size={24} strokeWidth={isActive ? 1.75 : 1.25} className="mt-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

const BottomNavigation = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/chat/') || location.pathname.startsWith('/provider/') || location.pathname.startsWith('/post/') || location.pathname.startsWith('/my/posts') || location.pathname.startsWith('/search-posts')) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-2 pb-safe flex justify-around items-center z-[999] max-w-md mx-auto right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
           <NavItem to="/" icon={Home} label="홈" />
           <NavItem to="/search" icon={MapPin} label="이모찾기" />
           <NavItem to="/momchin" icon={Users} label="팔로잉" />
           <NavItem to="/notifications" icon={Bell} label="알림" />
           <NavItem to="/my" icon={User} label="마이" />
        </div>
    );
};

const ProviderBottomNavigation = () => {
    const location = useLocation();

    // Hide navigation in Chat Room (but show in Chat List '/chat')
    if (location.pathname.startsWith('/chat/') && location.pathname !== '/chat') return null;

    // Show navigation for provider main tabs including general user tabs (Search, Community)
    // Ordered: Community, Search, Schedule, Chat, Manage
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-2 pb-safe flex justify-around items-center z-[999] max-w-md mx-auto right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
           <NavItem to="/community" icon={Users} label="커뮤니티" />
           <NavItem to="/search" icon={MapPin} label="이모찾기" />
           <NavItem to="/schedule" icon={Calendar} label="일정" />
           <NavItem to="/chat" icon={MessageCircle} label="문의" />
           <NavItem to="/" icon={Settings} label="관리" />
        </div>
    );
};

// ... (Page Components same as before) ...

// Include App component with overflow fix
const App = () => {
  const [userState, setUserState] = useState<UserState>({
    isAuthenticated: false,
    role: null,
    name: '맘플맘',
    intro: '오늘도 육아 화이팅!',
    avatar: undefined,
    points: 0,
    followerCount: 0,
    following: [],
    unlockedProviders: [],
    viewedReviews: {}
  });

  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [authStep, setAuthStep] = useState<'launch' | 'auth' | 'role' | 'provider_signup' | 'app'>('launch');
  
  // Schedules State for Provider
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Provider Data State for Reviews Management (Mocking persistent state for demo)
  // In a real app, this would be fetched from API
  // We initialize it with MOCK_PROVIDERS[0] which is 'p1' (assuming the logged in provider is p1)
  const [myProviderReviews, setMyProviderReviews] = useState<Review[]>(MOCK_PROVIDERS[0].reviews);

  const handleUpdateReview = (reviewId: string, updates: Partial<Review>) => {
      setMyProviderReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
  };

  const handleStart = () => setAuthStep('auth');
  const handleSelectMode = (mode: 'login' | 'signup') => {
      // For demo simplicty, go straight to role selection if they click login/signup
      setAuthStep('role'); 
  };

  // Handle successful login from AuthSelection
  const handleLoginSuccess = (user?: any) => {
      // If user object is returned from social login, use it
      const userName = user?.displayName || '새내기맘';
      const userEmail = user?.email;
      const userPhoto = user?.photoURL;
      
      // ADMIN BYPASS LOGIC
      if (user?.isAdmin) {
          setUserState(prev => ({ 
              ...prev, 
              isAuthenticated: true, 
              role: 'user', // Default admin to User role for immediate access
              name: '관리자',
              intro: '관리자 모드',
              avatar: undefined,
              points: 999999,
              followerCount: 0
          }));
          // REMOVED window.location.hash = '/' to prevent reload issues
          setAuthStep('app');
          return;
      }
      
      // Determine if we should go to Role Selection or App directly.
      // For this flow, we go to Role Selection to decide User vs Provider after login.
      setAuthStep('role');
      
      // Temporary state update (will be finalized in handleSelectRole)
      setUserState(prev => ({ 
          ...prev, 
          name: userName,
          avatar: userPhoto || undefined
      }));
  };

  const handleSelectRole = (role: UserRole) => {
    if (role === 'provider') {
      setAuthStep('provider_signup');
    } else {
      setUserState(prev => ({ 
          ...prev, 
          isAuthenticated: true, 
          role: 'user', 
          // Keep existing name/avatar from login if available
          name: prev.name || '새내기맘',
          intro: '오늘도 육아 화이팅!', // Default Intro
          points: 2000,
          followerCount: 24 // Dummy follower count
      }));
      // Redirect to home explicitly when logging in
      window.location.hash = '/';
      setAuthStep('app');
    }
  };
  
  const handleProviderComplete = (info: any) => {
     setUserState(prev => ({ 
       ...prev, 
       isAuthenticated: true, 
       role: 'provider', 
       name: info.businessName,
       intro: '엄마의 마음으로 케어합니다.',
       avatar: undefined,
       points: 0,
       followerCount: 0,
       providerInfo: {
         id: 'p1', // Force ID for demo
         businessName: info.businessName,
         businessRegNo: info.businessRegNo,
         description: '',
         imageUrl: 'https://picsum.photos/200'
       }
     }));
     window.location.hash = '/';
     setAuthStep('app');
  };

  const handleUpdateProviderInfo = (info: any) => {
      setUserState(prev => ({
          ...prev,
          providerInfo: {
              ...prev.providerInfo!,
              description: info.description,
              imageUrl: info.imageUrl,
              phoneNumber: info.phoneNumber
          }
      }));
  };

  const handleUpdateProfile = (updates: { intro?: string; avatar?: string }) => {
    setUserState(prev => ({ ...prev, ...updates }));
  };

  const handleChargePoints = (amount: number) => {
      setUserState(prev => ({
          ...prev,
          points: prev.points + amount
      }));
  };

  const handleToggleFollow = (id: string) => {
    setUserState(prev => {
        const isFollowing = prev.following.includes(id);
        return {
            ...prev,
            following: isFollowing ? prev.following.filter(f => f !== id) : [...prev.following, id]
        };
    });
  };
  
  const handleWriteReview = (providerId: string, content: string, rating: number, hasMedia: boolean, isVerified: boolean) => {
     // Mock update for ProviderDetailPage local state handled inside component
     // But if we want it to reflect in Provider Dashboard immediately, we would update state here.
     // For this prototype, separate states are fine or we can assume simple refresh.
     console.log('Review written:', { providerId, content, rating, hasMedia, isVerified });
  };
  
  const handleLogout = () => {
      setAuthStep('launch');
      setUserState({
        isAuthenticated: false,
        role: null,
        name: '맘플맘',
        intro: '',
        avatar: undefined,
        points: 0,
        followerCount: 0,
        following: [],
        unlockedProviders: [],
        viewedReviews: {}
      });
  };

  if (authStep === 'launch') return <LaunchScreen onStart={handleStart} />;
  // Update AuthSelection to accept onLoginSuccess to move to role selection
  if (authStep === 'auth') return <AuthSelection onLoginSuccess={handleLoginSuccess} />;
  if (authStep === 'role') return <RoleSelection onSelectRole={handleSelectRole} />;
  if (authStep === 'provider_signup') return <ProviderSignUp onComplete={handleProviderComplete} />;

  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-x-hidden">
        <Routes>
          <Route path="/" element={
            userState.role === 'provider' 
            ? <ProviderBusinessCenter userState={userState} />
            : <HomePage userState={userState} posts={posts} setPosts={setPosts} />
          } />
          
          <Route path="/search" element={<ProviderSearchPage userState={userState} />} />
          <Route path="/search-posts" element={<PostSearchPage posts={posts} />} />
          <Route path="/momchin" element={<MomchinPage userState={userState} onToggleFollow={handleToggleFollow} onUpdateProfile={handleUpdateProfile} />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/my" element={<MyPage userState={userState} setUserState={setUserState} onLogout={handleLogout} />} />
          <Route path="/my/posts" element={<MyPostsPage posts={posts} userState={userState} />} />
          
          <Route 
             path="/provider/:id" 
             element={<ProviderDetailPage onWriteReview={handleWriteReview} customReviews={userState.role === 'provider' && userState.providerInfo?.id === 'p1' ? myProviderReviews : undefined} />} 
          />
          <Route path="/post/:id" element={<PostDetailPage posts={posts} userState={userState} onToggleFollow={handleToggleFollow} />} />
          
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:id" element={<ChatRoomPage />} />
          
          {/* Provider specific routes */}
          <Route path="/schedule" element={<ProviderSchedulePage schedules={schedules} onAddSchedule={(s) => setSchedules([...schedules, s])} />} />
          <Route path="/community" element={<HomePage userState={userState} posts={posts} setPosts={setPosts} />} />
          <Route path="/provider/edit" element={<ProviderEditPage userState={userState} onUpdate={handleUpdateProviderInfo} />} />
          <Route path="/provider/ads" element={<ProviderAdsPage />} />
          <Route path="/provider/reviews" element={<ProviderReviewsPage reviews={myProviderReviews} onUpdateReview={handleUpdateReview} />} />
          <Route path="/provider/points" element={<ProviderPointsPage currentPoints={userState.points} onCharge={handleChargePoints} />} />
        </Routes>
        
        {userState.role === 'provider' ? <ProviderBottomNavigation /> : <BottomNavigation />}
      </div>
    </Router>
  );
};

export default App;