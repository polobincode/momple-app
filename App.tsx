import React, { useState, useRef, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Siren, Share2, UserCheck, UserPlus, ThumbsUp, MessageSquareText, Send, 
  Heart, CornerDownRight, X, User, MessageCircle, Home, Search as SearchIcon, MessageSquare, Users, Menu,
  Bell, Edit3, Eye, Settings, FileText, CreditCard, ChevronRight, LogOut, Megaphone, Lock, Mail, ChevronLeft, Camera, Check, Edit2, ShieldAlert,
  Building2, Briefcase, Calendar, Globe, Phone, FileCheck, Loader2, Wallet, Crown, History, MoreVertical, LayoutDashboard
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import auth functions

import { CommunityPost, UserState, Comment, Schedule, Review, UserRole, Notification } from './types';
import { MOCK_COMMUNITY_POSTS, MOCK_NOTIFICATIONS, FORBIDDEN_WORDS } from './constants';
import { loginWithKakao, loginWithGoogle, handleGoogleRedirect, loginWithEmail, signUpWithEmail, initKakao } from './services/authService';
import { auth } from './services/firebaseConfig'; // Import auth instance
import { verifyBusinessLicense } from './services/geminiService';

import ProviderSearchPage from './components/ProviderSearchPage';
import ProviderDetailPage from './components/ProviderDetailPage';
import { ChatListPage, ChatRoomPage } from './components/ChatPages';
import MomchinPage from './components/MomchinPage';
import { ProviderEditPage, ProviderAdsPage, ProviderReviewsPage, ProviderPointsPage } from './components/ProviderBusinessPages';
import ProviderSchedulePage from './components/ProviderSchedulePage';
import PostWritePage from './components/PostWritePage';
import PartnerSubscriptionPage from './components/PartnerSubscriptionPage';
import { AdminDashboard } from './components/AdminDashboard';

// --- Utility: Content Safety Check ---
const checkContentSafety = (text: string) => {
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) {
      return { safe: false, detected: word };
    }
  }
  return { safe: true };
};

// --- Component: ReportModal ---
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
  targetType: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, targetType }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
                <X size={24} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{targetType} 신고하기</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">신고 사유</label>
                    <select 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none border border-gray-200"
                    >
                        <option value="">사유를 선택해주세요</option>
                        <option value="abuse">욕설/비하</option>
                        <option value="spam">스팸/부적절한 홍보</option>
                        <option value="info">개인정보 유출</option>
                        <option value="other">기타</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">상세 내용</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none border border-gray-200 resize-none h-24"
                        placeholder="신고 내용을 상세히 작성해주세요."
                    />
                </div>
                <button 
                    onClick={() => onSubmit(reason, description)}
                    disabled={!reason}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${reason ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    신고 제출
                </button>
            </div>
        </div>
    </div>
  );
};

// --- Component: SplashScreen ---
const SplashScreen = ({ isFading }: { isFading: boolean }) => {
  return (
    <div className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center ${isFading ? 'animate-fade-out' : 'animate-fade-in'}`}>
      {/* Text Only Splash Screen as requested */}
      <h1 className="text-5xl font-bold text-[#2AC1BC] tracking-tight mb-3">Momple</h1>
      <p className="text-black text-sm font-medium tracking-wide">클린한 맘커뮤니티</p>
    </div>
  );
};

// --- Component: HomePage ---
const HomePage = ({ userState, posts }: { userState: UserState, posts: CommunityPost[] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filteredPosts = activeTab === 'popular' 
    ? posts.filter(p => p.isPopular) 
    : posts;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
         <h1 className="font-bold text-xl text-primary">Momple</h1>
         <div className="flex gap-4 text-gray-600">
           <button onClick={() => navigate('/search-posts')}><SearchIcon size={22} /></button>
           <button onClick={() => navigate('/notifications')} className="relative">
             <Bell size={22} />
             {MOCK_NOTIFICATIONS.some(n => !n.isRead) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             )}
           </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 mb-2">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
        >
          전체글
        </button>
        <button 
          onClick={() => setActiveTab('popular')} 
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'popular' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
        >
          🔥 인기글
        </button>
      </div>

      {/* Post List */}
      <div className="space-y-2">
        {filteredPosts.map(post => (
          <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="bg-white p-4 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
               {post.isNotice && <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold">공지</span>}
               <span className="text-xs font-bold text-gray-600">{post.authorName}</span>
               <span className="text-[10px] text-gray-400">{post.timeAgo}</span>
            </div>
            <h3 className="font-bold text-base mb-1 text-gray-900 line-clamp-1">{post.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{post.content}</p>
            
            {post.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gray-100">
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400">
               <span className="flex items-center gap-1"><Eye size={14} /> {post.viewCount}</span>
               <span className="flex items-center gap-1"><ThumbsUp size={14} /> {post.likeCount}</span>
               <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.commentCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => navigate('/write')}
        className="fixed bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-transform active:scale-95 z-50 flex items-center justify-center"
      >
        <Edit3 size={24} />
      </button>
    </div>
  );
};

// --- Component: PostSearchPage ---
const PostSearchPage = ({ posts }: { posts: CommunityPost[] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = query.trim() 
    ? posts.filter(p => p.title.includes(query) || p.content.includes(query)) 
    : [];

  return (
    <div className="min-h-screen bg-white">
       <div className="sticky top-0 bg-white z-10 px-4 h-14 flex items-center gap-2 border-b border-gray-100">
         <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
         <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
            <input 
              autoFocus
              className="bg-transparent flex-1 text-sm outline-none"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery('')}><X size={16} className="text-gray-400" /></button>}
         </div>
       </div>
       
       <div className="p-4">
         {query && results.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
         )}
         <div className="space-y-4">
            {results.map(post => (
               <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="border-b border-gray-50 pb-4 cursor-pointer">
                  <h3 className="font-bold text-sm mb-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
               </div>
            ))}
         </div>
       </div>
    </div>
  );
};

// --- Component: PostDetailPage ---
const PostDetailPage = ({ 
  posts, userState, onToggleFollow, onWriteComment 
}: { 
  posts: CommunityPost[], 
  userState: UserState, 
  onToggleFollow: (id: string) => void,
  onWriteComment: () => void
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]); // Mock local comments

  if (!post) return <div>Post not found</div>;

  const handleSendComment = () => {
    if(!comment.trim()) return;
    const newComment: Comment = {
       id: `cmt_${Date.now()}`,
       authorName: userState.name,
       content: comment,
       timeAgo: '방금',
       likeCount: 0
    };
    setComments([...comments, newComment]);
    setComment('');
    onWriteComment();
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
       <div className="sticky top-0 bg-white z-10 px-4 h-14 flex items-center justify-between border-b border-gray-100">
         <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
         <div className="flex gap-4 text-gray-600">
            <Share2 size={22} />
            <MoreVertical size={22} />
         </div>
       </div>
       
       <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-5 border-b border-gray-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                   <span>👩</span>
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-sm text-gray-900">{post.authorName}</h3>
                   <p className="text-xs text-gray-400">{post.timeAgo} · 조회 {post.viewCount}</p>
                </div>
                {post.authorId !== 'me' && (
                   <button 
                     onClick={() => onToggleFollow(post.authorId)} 
                     className="bg-gray-100 text-xs font-bold px-3 py-1.5 rounded-full text-gray-600"
                   >
                     팔로우
                   </button>
                )}
             </div>
             
             <h2 className="font-bold text-xl mb-3">{post.title}</h2>
             <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
             
             {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="w-full rounded-xl mb-4" />
             )}

             <div className="flex gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><ThumbsUp size={16} /> {post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageSquare size={16} /> {post.commentCount + comments.length}</span>
             </div>
          </div>

          {/* Comments */}
          <div className="p-5">
             <h3 className="font-bold text-sm mb-4">댓글 {post.commentCount + comments.length}</h3>
             {comments.map(c => (
                <div key={c.id} className="flex gap-3 mb-4">
                   <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                      {c.authorName.charAt(0)}
                   </div>
                   <div className="flex-1 bg-gray-50 p-3 rounded-xl rounded-tl-none">
                      <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-xs">{c.authorName}</span>
                         <span className="text-[10px] text-gray-400">{c.timeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-700">{c.content}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Comment Input */}
       <div className="p-3 bg-white border-t border-gray-100 sticky bottom-0 pb-safe">
          <div className="flex gap-2 items-center bg-gray-50 rounded-full px-4 py-1">
             <input 
               className="flex-1 bg-transparent py-2.5 text-sm outline-none"
               placeholder="댓글을 남겨보세요."
               value={comment}
               onChange={(e) => setComment(e.target.value)}
             />
             <button 
                onClick={handleSendComment}
                className={`font-bold text-sm ${comment.trim() ? 'text-primary' : 'text-gray-400'}`}
             >
                등록
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Component: NotificationPage ---
const NotificationPage = () => {
   const navigate = useNavigate();

   return (
     <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white z-10 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
           <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
           <h1 className="font-bold text-lg">알림</h1>
        </div>
        
        <div className="divide-y divide-gray-50">
           {MOCK_NOTIFICATIONS.map(notif => (
              <div key={notif.id} className={`p-4 flex gap-3 ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                 <div className="mt-1">
                    {notif.type === 'like' && <Heart size={18} className="text-red-500" />}
                    {notif.type === 'comment' && <MessageSquare size={18} className="text-blue-500" />}
                    {notif.type === 'notice' && <Megaphone size={18} className="text-gray-900" />}
                 </div>
                 <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-snug mb-1">{notif.content}</p>
                    <span className="text-xs text-gray-400">{notif.timeAgo}</span>
                 </div>
              </div>
           ))}
        </div>
     </div>
   );
};

// --- Component: LoginPage ---
interface LoginPageProps {
  onLoginSuccess: (user: any, isSignup?: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [userType, setUserType] = useState<'general' | 'partner'>('general');
  // view mode: 'social' (default for general), 'login' (email/partner login), 'signup' (email/partner signup)
  const [view, setView] = useState<'social' | 'login' | 'signup'>('social');
  
  const [id, setId] = useState(''); // Email or ID
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(false);

  // Partner Specific States
  const [businessName, setBusinessName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);

  // ID Validation Regex (Alphanumeric only)
  const isAlphanumeric = (str: string) => /^[a-zA-Z0-9]+$/.test(str);

  // Reset fields when switching user types
  useEffect(() => {
    setView(userType === 'general' ? 'social' : 'login');
    setId('');
    setPassword('');
    setBusinessName('');
    setLicenseFile(null);
    setIsLicenseVerified(false);
  }, [userType]);

  // [Login Logic Check]
  // 1. Kakao
  const handleKakaoLogin = async () => {
    setLoading(true);
    const result = await loginWithKakao();
    setLoading(false);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      alert(result.error);
    }
  };

  // 2. Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    
    // If mocking or error handled immediately
    if (result.success && result.user) {
        setLoading(false);
        onLoginSuccess(result.user);
        return;
    }

    if (!result.success && !result.isRedirect) {
       setLoading(false);
       alert(result.error);
    }
    // If result.isRedirect is true, the browser is navigating away, so we do nothing.
  };

  // 3. Email/ID Login (Both General and Partner)
  const handleLogin = async () => {
    if (!id || !password) return;

    // --- Hardcoded Admin Check 1 (QASolution) ---
    if (id === 'qasolution' && password === 'Dkdlfltm1!') {
        onLoginSuccess({
            displayName: '관리자',
            email: 'admin@momple.com',
            photoURL: null,
            uid: 'admin_master',
            role: 'admin'
        });
        return;
    }

    // --- Hardcoded Admin Check 2 (Momple - General) ---
    if (id === '맘플' && password === 'Dkdlfltm1!') {
        if (userType === 'partner') {
            alert('일반회원 관리자 아이디입니다. 일반회원 탭에서 로그인해주세요.');
            return;
        }
        onLoginSuccess({
            displayName: '맘플',
            email: 'official@momple.com',
            photoURL: null,
            uid: 'admin_momple',
            role: 'admin'
        });
        return;
    }
    
    // --- Hardcoded General User Test Account (yoonokmom) ---
    if (id === 'yoonokmom' && password === 'iioo0862!') {
        if (userType === 'partner') {
            alert('일반회원 아이디입니다. 일반회원 탭에서 로그인해주세요.');
            return;
        }
        onLoginSuccess({
            displayName: '윤옥맘',
            email: 'yoonokmom@test.com',
            uid: 'yoonokmom',
            role: 'user',
            intro: '초보맘 윤옥맘입니다~ 육아 소통해요!'
        });
        return;
    }

    // --- Hardcoded Partner Admin Check (Momple Partners - Super Admin for Providers) ---
    if (id === '맘플파트너스' && password === 'Dkdlfltm1!') {
        if (userType === 'general') {
            alert('파트너스 관리자 아이디입니다. 파트너스 탭에서 로그인해주세요.');
            return;
        }
        
        onLoginSuccess({
            displayName: '맘플파트너스',
            email: 'partners@momple.com',
            photoURL: null,
            uid: 'admin_partners',
            role: 'admin', // Admin Role to manage other providers
            subscription: {
                status: 'active',
                expiryDate: new Date('2099-12-31').toISOString()
            }
        });
        return;
    }

    // --- Hardcoded Real Provider Test Account (ereimombs) ---
    if (id === 'ereimombs' && password === 'iioo0862!') {
        if (userType === 'general') {
            alert('파트너스 아이디입니다. 파트너스 탭에서 로그인해주세요.');
            return;
        }
        
        // Simulating an existing provider from the API that has claimed their account
        // We give them a trial subscription
        const now = new Date();
        const trialEndDate = new Date(now.setDate(now.getDate() + 15));

        onLoginSuccess({
            displayName: '이레아이맘', // Example Name
            email: 'ereimombs@test.com',
            uid: 'ereimombs',
            role: 'provider',
            subscription: {
                status: 'trial',
                expiryDate: trialEndDate.toISOString()
            },
            providerInfo: {
                businessName: '이레아이맘 부산지사',
                businessRegNo: '123-45-67890',
                description: '정성으로 모시는 산후관리사 전문 업체입니다.',
                imageUrl: 'https://picsum.photos/500/300?random=88',
                phoneNumber: '051-123-4567'
            }
        });
        return;
    }
    // -----------------------------

    // ID Validation: Must be alphanumeric (unless it's one of the hardcoded admins above)
    if (!isAlphanumeric(id)) {
        alert('아이디는 영문과 숫자만 입력 가능합니다.');
        return;
    }

    setLoading(true);
    // Mock Login for demo simplicity if check passes
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    
    // Simulate successful login for valid alphanumeric IDs
    const mockRole = userType === 'partner' ? 'provider' : 'user';
    
    const now = new Date();
    const mockSubscription = userType === 'partner' ? {
        status: 'trial',
        expiryDate: new Date(now.setDate(now.getDate() + 15)).toISOString()
    } : undefined;

    onLoginSuccess({
        displayName: userType === 'partner' ? (businessName || id) : (name || id),
        email: `${id}@momple.test`,
        uid: `user_${id}`,
        role: mockRole,
        subscription: mockSubscription
    });
  };

  // 4. Partner Signup
  const handlePartnerSignup = async () => {
    if (!id || !password || !businessName || !businessNo || !phoneNumber || !isLicenseVerified) {
        alert("모든 필수 정보를 입력하고 사업자등록증 검증을 완료해주세요.");
        return;
    }

    if (!isAlphanumeric(id)) {
        alert('아이디는 영문과 숫자만 입력 가능합니다.');
        return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate API call
    setLoading(false);

    alert("파트너스 가입이 완료되었습니다!\n15일간 무료 체험이 시작됩니다.");
    
    // Auto login after signup with 15 days trial
    const now = new Date();
    const trialEndDate = new Date(now.setDate(now.getDate() + 15));

    onLoginSuccess({
        displayName: businessName,
        email: `${id}@momple.partner`,
        uid: `p_${id}`,
        role: 'provider',
        subscription: {
            status: 'trial',
            expiryDate: trialEndDate.toISOString()
        }
    }, true);
  };

  // 5. License Verification
  const handleLicenseVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setLicenseFile(file);
          setIsVerifyingLicense(true);
          
          const isValid = await verifyBusinessLicense(file);
          
          setIsVerifyingLicense(false);
          if (isValid) {
              setIsLicenseVerified(true);
              alert("사업자등록증이 확인되었습니다.");
          } else {
              setIsLicenseVerified(false);
              setLicenseFile(null);
              alert("유효한 사업자등록증을 인식하지 못했습니다.\n선명한 이미지를 다시 업로드해주세요.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col animate-fade-in">
       {/* Top Tabs */}
       <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setUserType('general')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${userType === 'general' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 bg-gray-50'}`}
          >
            일반회원
          </button>
          <button 
            onClick={() => setUserType('partner')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${userType === 'partner' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 bg-gray-50'}`}
          >
            파트너스 (업체)
          </button>
       </div>

       {/* General Member Social View */}
       {userType === 'general' && view === 'social' && (
           <div className="flex-1 flex flex-col p-6">
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
                  <h2 className="text-4xl font-bold text-primary mb-2 tracking-tight">맘플</h2>
                  <p className="text-gray-900 text-sm mb-12 font-medium">클린한 초보맘들의 커뮤니티</p>

                  <div className="w-full space-y-3 animate-fade-in-up">
                      <button 
                        onClick={handleKakaoLogin}
                        disabled={loading}
                        className="w-full bg-[#FEE500] text-[#000000] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors relative"
                      >
                         <MessageCircle size={20} fill="currentColor" className="absolute left-4" />
                         카카오로 3초만에 시작하기
                      </button>

                      <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative"
                      >
                         <div className="absolute left-4 w-5 h-5 bg-contain bg-no-repeat" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg)'}}></div>
                         구글로 계속하기
                      </button>

                      <div className="mt-4 text-center">
                         <button onClick={() => setView('login')} className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto underline">
                            이메일 로그인
                         </button>
                      </div>
                  </div>
              </div>
              
              <div className="text-center pb-safe mt-6">
                <p className="text-[10px] text-gray-300">
                    로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                </p>
             </div>
           </div>
       )}

       {/* General/Partner Login View */}
       {view === 'login' && (
           <div className="flex-1 flex flex-col p-6 relative">
                {(userType === 'general') && (
                    <button onClick={() => setView('social')} className="absolute top-6 left-6 text-gray-800 z-10">
                        <ArrowLeft size={24} />
                    </button>
                )}
                
                <div className="flex-1 flex flex-col max-w-sm w-full mx-auto justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        {userType === 'general' ? '이메일 로그인' : '파트너스 로그인'}
                    </h2>
                    
                    <div className="space-y-4">
                        <input 
                        type="text" 
                        placeholder="아이디 (영문+숫자)" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        />
                        <input 
                        type="password" 
                        placeholder="비밀번호" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <button 
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-colors mt-6 shadow-lg shadow-gray-200"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>

                    <div className="mt-6 text-center">
                        <span className="text-gray-400 text-xs">계정이 없으신가요? </span>
                        <button onClick={() => setView('signup')} className="text-primary font-bold text-xs ml-1 hover:underline">
                            {userType === 'general' ? '이메일 회원가입' : '입점 신청하기'}
                        </button>
                    </div>
                </div>
           </div>
       )}

       {/* General Signup View */}
       {userType === 'general' && view === 'signup' && (
           <div className="flex-1 flex flex-col p-6">
                <button onClick={() => setView('login')} className="mb-8 self-start text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                
                <div className="flex-1 flex flex-col max-w-sm w-full mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">이메일 회원가입</h2>
                    
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="아이디 (영문+숫자)" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="닉네임" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="비밀번호 (6자리 이상)" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={async () => {
                            if (!id || !password || !name) { alert("모든 필드를 입력해주세요."); return; }
                            if (!isAlphanumeric(id)) { alert("아이디는 영문과 숫자만 가능합니다."); return; }
                            setLoading(true);
                            await new Promise(r => setTimeout(r, 1000));
                            setLoading(false);
                            alert("회원가입이 완료되었습니다!");
                            onLoginSuccess({ displayName: name, email: `${id}@momple.com`, uid: `u_${id}`, role: 'user' });
                        }}
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors mt-6 shadow-lg shadow-primary/30"
                    >
                        {loading ? '가입 처리 중...' : '회원가입'}
                    </button>
                </div>
           </div>
       )}

       {/* Partner Signup View */}
       {userType === 'partner' && view === 'signup' && (
           <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <button onClick={() => setView('login')} className="mb-4 self-start text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">파트너스 입점 신청</h2>
                <div className="bg-primary/10 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <Crown className="text-primary shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-bold text-primary text-sm mb-1">15일 무료 체험 혜택</h3>
                        <p className="text-xs text-gray-600 leading-snug">
                            가입 즉시 15일간 모든 파트너스 기능을<br/>무료로 체험하실 수 있습니다.
                        </p>
                    </div>
                </div>
                
                <div className="space-y-4 pb-10">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">계정 정보</label>
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                placeholder="아이디 (영문+숫자)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                            />
                            <input 
                                type="password" 
                                placeholder="비밀번호" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">업체 정보</label>
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                placeholder="업체명 (상호)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="사업자등록번호 (10자리)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={businessNo}
                                onChange={(e) => setBusinessNo(e.target.value)}
                            />
                            <input 
                                type="tel" 
                                placeholder="대표 전화번호" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <input 
                                type="url" 
                                placeholder="홈페이지 주소 (선택)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            사업자등록증 첨부 <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
                            {isLicenseVerified ? (
                                <div className="flex flex-col items-center text-green-600">
                                    <Check size={32} className="mb-2" />
                                    <span className="text-sm font-bold">검증 완료</span>
                                </div>
                            ) : isVerifyingLicense ? (
                                <div className="flex flex-col items-center text-primary">
                                    <Loader2 size={32} className="animate-spin mb-2" />
                                    <span className="text-sm font-bold">AI 검증 중...</span>
                                </div>
                            ) : (
                                <label className="cursor-pointer block w-full h-full">
                                    <FileCheck size={32} className="mx-auto text-gray-300 mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">이미지 업로드하여 인증하기</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLicenseVerify} />
                                </label>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handlePartnerSignup}
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors mt-6 shadow-lg shadow-primary/30"
                    >
                        {loading ? '처리 중...' : '무료 체험으로 시작하기'}
                    </button>
                </div>
           </div>
       )}
    </div>
  );
};

// --- Component: MyPage ---
interface MyPageProps {
  userState: UserState;
  onLogout: () => void;
  onUpdateProfile: (updates: { intro?: string; avatar?: string; name?: string; lastNicknameChangeDate?: string }) => void;
}

const MyPage = ({ userState, onLogout, onUpdateProfile }: MyPageProps) => {
    const navigate = useNavigate();
    const isProvider = userState.role === 'provider';
    const isAdmin = userState.role === 'admin';

    // Edit States
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(userState.name);
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [newIntro, setNewIntro] = useState(userState.intro || '');

    // Subscription Status Logic
    const subscription = userState.subscription;
    const isSubscribed = subscription && (subscription.status === 'active' || subscription.status === 'trial');
    
    // Calculate D-Day for Trial
    let trialDDay = '';
    if (subscription?.status === 'trial') {
        const now = new Date();
        const expiry = new Date(subscription.expiryDate);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        trialDDay = diffDays > 0 ? `D-${diffDays}` : '만료됨';
    }

    const handleAccessCheck = (path: string) => {
        if (subscription && (subscription.status === 'active' || (subscription.status === 'trial' && new Date(subscription.expiryDate) > new Date()))) {
            navigate(path);
        } else {
            if (window.confirm("이 기능은 파트너스 멤버십 구독 후 이용 가능합니다.\n이용료 결제 페이지로 이동하시겠습니까?")) {
                navigate('/partner-subscription');
            }
        }
    };

    // Nickname Change Logic
    const handleNicknameChange = () => {
        // ... existing logic ...
        onUpdateProfile({ name: newName });
        setIsEditingName(false);
    };

    const handleIntroChange = () => {
        onUpdateProfile({ intro: newIntro });
        setIsEditingIntro(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            onUpdateProfile({ avatar: imageUrl });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-6 mb-2">
                <div className="flex items-center gap-4 mb-4">
                    {/* Editable Avatar - Left Side */}
                    <label className="relative cursor-pointer group shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl overflow-hidden border border-gray-100">
                            {userState.avatar ? (
                                <img src={userState.avatar} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{isProvider ? '🏢' : (isAdmin ? '👑' : '👩‍🍼')}</span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera size={24} className="text-white" />
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>

                    {/* Right Side Info Column */}
                    <div className="flex-1 min-w-0">
                        {/* 1. Nickname & Follower Count */}
                        <div className="flex items-center gap-2 mb-1.5">
                            {isEditingName ? (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-primary w-32"
                                        autoFocus
                                    />
                                    <button onClick={handleNicknameChange} className="p-1 text-green-600 bg-green-50 rounded"><Check size={14}/></button>
                                    <button onClick={() => {setIsEditingName(false); setNewName(userState.name);}} className="p-1 text-gray-400 bg-gray-100 rounded"><X size={14}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h2 
                                        className="font-bold text-xl text-gray-900 cursor-pointer hover:underline decoration-dashed underline-offset-4"
                                        onClick={() => setIsEditingName(true)}
                                        title="클릭하여 닉네임 변경"
                                    >
                                        {userState.name}
                                    </h2>
                                    {isProvider && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold">PARTNER</span>}
                                    {isAdmin && <span className="bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                                    {!isProvider && !isAdmin && (
                                        <div className="flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 font-medium">
                                            <Users size={10} />
                                            <span>{userState.followerCount}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* 2. Status Message (Intro) */}
                        <div className="mb-1.5">
                            {isEditingIntro ? (
                                 <div className="flex items-center gap-1 mt-1">
                                    <input 
                                        type="text" 
                                        value={newIntro} 
                                        onChange={(e) => setNewIntro(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-primary w-full"
                                        placeholder="상태메시지 입력"
                                        autoFocus
                                    />
                                    <button onClick={handleIntroChange} className="p-1 text-green-600 bg-green-50 rounded"><Check size={14}/></button>
                                    <button onClick={() => {setIsEditingIntro(false); setNewIntro(userState.intro || '');}} className="p-1 text-gray-400 bg-gray-100 rounded"><X size={14}/></button>
                                 </div>
                            ) : (
                                <p 
                                    className="text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 truncate"
                                    onClick={() => {setIsEditingIntro(true); setNewIntro(userState.intro || '');}}
                                >
                                    {userState.intro || (isProvider ? '업체 소개를 입력해주세요.' : '상태메시지 없음 (클릭하여 수정)')} 
                                </p>
                            )}
                        </div>

                        {/* 3. Points & Activity Stats */}
                        <div>
                            {!isAdmin && (
                                <div className="text-sm font-bold text-primary">
                                    포인트 {userState.points.toLocaleString()}P
                                </div>
                            )}
                            {!isProvider && !isAdmin && (
                                <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                                    <span>작성 글 <strong className="text-gray-800">{userState.postCount}</strong></span>
                                    <span className="w-px h-3 bg-gray-300 my-auto"></span>
                                    <span>작성 댓글 <strong className="text-gray-800">{userState.commentCount}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isProvider && (
                    <div className="mb-4">
                        {subscription?.status === 'trial' && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex justify-between items-center cursor-pointer" onClick={() => navigate('/partner-subscription')}>
                                <div className="flex items-center gap-2">
                                    <Crown size={18} className="text-primary" />
                                    <div>
                                        <p className="text-xs font-bold text-primary">무료 체험 중 ({trialDDay})</p>
                                        <p className="text-[10px] text-gray-600">모든 파트너스 기능을 이용 중입니다.</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-primary font-bold underline">구독 전환</span>
                            </div>
                        )}
                        {subscription?.status === 'active' && (
                            <div className="bg-gray-900 text-white rounded-xl p-3 flex items-center gap-2">
                                <Crown size={18} className="text-yellow-400" />
                                <span className="text-xs font-bold">프리미엄 파트너스 이용 중</span>
                            </div>
                        )}
                        {(!subscription || subscription.status === 'expired') && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex justify-between items-center cursor-pointer" onClick={() => navigate('/partner-subscription')}>
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-red-500" />
                                    <div>
                                        <p className="text-xs font-bold text-red-600">이용 기간 만료</p>
                                        <p className="text-[10px] text-gray-500">서비스 이용을 위해 구독이 필요합니다.</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-red-500 font-bold underline">결제하기</span>
                            </div>
                        )}
                    </div>
                )}

                {isAdmin ? (
                    // --- Admin Menu (Momple Partners) ---
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={() => navigate('/admin-dashboard')} className="bg-gray-900 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-black transition-colors col-span-2">
                            <LayoutDashboard size={24} />
                            <span className="text-sm font-bold">관리자 대시보드</span>
                            <span className="text-[10px] font-light opacity-80">가입 승인 및 신고 관리</span>
                        </button>
                    </div>
                ) : isProvider ? (
                    // --- Provider Menu Grid ---
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={() => handleAccessCheck('/provider-edit')} className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors relative">
                            {!isSubscribed && <Lock size={16} className="absolute top-3 right-3 text-gray-400" />}
                            <Building2 size={24} className={isSubscribed ? "text-gray-600" : "text-gray-400"} />
                            <span className={`text-xs font-bold ${isSubscribed ? "text-gray-700" : "text-gray-400"}`}>업체정보 수정</span>
                        </button>
                        <button onClick={() => handleAccessCheck('/provider-reviews')} className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors relative">
                            {!isSubscribed && <Lock size={16} className="absolute top-3 right-3 text-gray-400" />}
                            <ThumbsUp size={24} className={isSubscribed ? "text-gray-600" : "text-gray-400"} />
                            <span className={`text-xs font-bold ${isSubscribed ? "text-gray-700" : "text-gray-400"}`}>베스트 후기 선정</span>
                        </button>
                        <button onClick={() => handleAccessCheck('/chat')} className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors relative">
                            {!isSubscribed && <Lock size={16} className="absolute top-3 right-3 text-gray-400" />}
                            <MessageSquareText size={24} className={isSubscribed ? "text-gray-600" : "text-gray-400"} />
                            <span className={`text-xs font-bold ${isSubscribed ? "text-gray-700" : "text-gray-400"}`}>문의 DM</span>
                        </button>
                        <button onClick={() => handleAccessCheck('/provider-schedule')} className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors relative">
                            {!isSubscribed && <Lock size={16} className="absolute top-3 right-3 text-gray-400" />}
                            <Calendar size={24} className={isSubscribed ? "text-gray-600" : "text-gray-400"} />
                            <span className={`text-xs font-bold ${isSubscribed ? "text-gray-700" : "text-gray-400"}`}>예약 스케쥴 관리</span>
                        </button>
                    </div>
                ) : (
                    // --- User Menu Buttons ---
                    <div className="flex gap-2">
                        <button className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                            <FileText size={18} /> 내가 쓴 글
                        </button>
                        <button className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                            <Heart size={18} /> 찜한 목록
                        </button>
                        <button className="flex-1 bg-gray-50 py-3 rounded-xl text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
                            <CreditCard size={18} /> 결제 내역
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 space-y-4">
                {isProvider && (
                    <div 
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => navigate('/partner-subscription')}
                    >
                        <span className="font-bold text-gray-800 flex items-center gap-2">
                            <Wallet size={18} className="text-gray-600" /> 서비스 이용료 결제
                        </span>
                        <ChevronRight size={18} className="text-gray-300" />
                    </div>
                )}
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

// --- Main App Component ---
function App() {
  const [splashState, setSplashState] = useState<'visible' | 'fading' | 'hidden'>('visible');
  const [userState, setUserState] = useState<UserState>({
    isAuthenticated: false, // Default to false to show Login Screen
    role: null,
    name: '',
    intro: '',
    points: 0,
    followerCount: 0,
    following: [],
    postCount: 0, // Track posts
    commentCount: 0, // Track comments
    unlockedProviders: [],
    viewedReviews: {},
  });
  
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);

  // Splash Screen Effect
  useEffect(() => {
    // Start fading out after 2s
    const fadeTimer = setTimeout(() => {
        setSplashState('fading');
    }, 2000); 

    // Remove from DOM after fade out completes (e.g., 2s + 0.6s)
    const hideTimer = setTimeout(() => {
        setSplashState('hidden');
    }, 2600); 

    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  // Initialize Auth State (Persistence Logic)
  useEffect(() => {
    // 0. Init Kakao SDK
    initKakao();

    // 1. Check LocalStorage (for hardcoded admin or simple persistence)
    const storedUser = localStorage.getItem('momple_user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            // Don't need to save to localstorage again inside
            handleLoginSuccess(user, false); 
        } catch (e) {
            console.error("Failed to parse stored user", e);
        }
    }

    // 2. Check Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // Logic: If localStorage has 'qasolution' or other hardcoded, keep it.
            // If not, and Firebase has user, log them in.
            const currentStored = localStorage.getItem('momple_user');
            if (!currentStored) {
                handleLoginSuccess({
                    displayName: user.displayName || user.email?.split('@')[0],
                    email: user.email,
                    photoURL: user.photoURL,
                    uid: user.uid,
                    role: 'user' // Default role for social login
                });
            }
        }
    });

    // Handle Google Redirect Result on Mount
    handleGoogleRedirect().then((result) => {
        if (result && result.success && result.user) {
            handleLoginSuccess(result.user);
        }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: any, shouldSave = true) => {
    const isProvider = user.role === 'provider';
    const isAdmin = user.role === 'admin';
    
    // Merge existing userState subscription if not provided in user object
    // In a real app, 'user' object from API would contain latest subscription info.
    // Here we preserve it if logging in with same session, or use what's passed (e.g. from signup)
    const mergedSubscription = user.subscription || userState.subscription;
    
    // Determine intro based on role
    let intro = '안녕하세요! 맘플에 오신 것을 환영합니다.';
    if (isAdmin) intro = '맘플 통합 관리자 계정입니다.';
    else if (isProvider) intro = '안녕하세요. 파트너스 공식 계정입니다.';
    
    if (user.intro) intro = user.intro;

    setUserState(prev => ({
        ...prev,
        isAuthenticated: true,
        name: user.displayName || user.email?.split('@')[0] || '사용자',
        role: user.role || 'user', // Accept custom role if provided
        avatar: user.photoURL,
        intro: intro,
        postCount: 0, // Reset to 0 for demo purposes (or load from DB in real app)
        commentCount: 0,
        subscription: mergedSubscription, // Set subscription
        providerInfo: user.providerInfo || prev.providerInfo // Restore provider info if available
    }));

    if (shouldSave) {
        localStorage.setItem('momple_user', JSON.stringify({ ...user, subscription: mergedSubscription, providerInfo: user.providerInfo }));
    }
  };

  const handleSubscribe = () => {
      // Logic for successful payment
      const now = new Date();
      const expiryDate = new Date(now.setDate(now.getDate() + 30)).toISOString();
      
      const updatedSubscription = {
          status: 'active' as const,
          expiryDate: expiryDate
      };

      setUserState(prev => {
          const newState = { ...prev, subscription: updatedSubscription };
          // Update Local Storage
          const currentUser = JSON.parse(localStorage.getItem('momple_user') || '{}');
          localStorage.setItem('momple_user', JSON.stringify({ ...currentUser, subscription: updatedSubscription }));
          return newState;
      });
  };

  const handleToggleFollow = (userId: string) => {
    setUserState(prev => {
        const isFollowing = prev.following.includes(userId);
        return {
            ...prev,
            following: isFollowing 
                ? prev.following.filter(id => id !== userId)
                : [...prev.following, userId]
        };
    });
  };

  const handleUpdateProfile = (updates: { intro?: string; avatar?: string; name?: string; lastNicknameChangeDate?: string }) => {
    setUserState(prev => ({ ...prev, ...updates }));
    // In a real app, you would also update the backend/localStorage here
    const currentUser = JSON.parse(localStorage.getItem('momple_user') || '{}');
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('momple_user', JSON.stringify(updatedUser));
  };

  const handleWriteReview = (providerId: string, content: string, rating: number, hasMedia: boolean, isVerified: boolean) => {
    console.log('Review written:', { providerId, content, rating, hasMedia, isVerified });
  };
  
  const handleUpdateReview = (reviewId: string, updates: Partial<Review>) => {
    console.log('Review updated:', reviewId, updates);
  };

  const handleUpdateProviderInfo = (info: any) => {
    setUserState(prev => ({
       ...prev,
       providerInfo: { ...prev.providerInfo!, ...info }
    }));
  };

  const handleCharge = (amount: number) => {
    setUserState(prev => ({ ...prev, points: prev.points + amount }));
  };

  const handleAddSchedule = (schedule: Schedule) => {
     console.log('Schedule added:', schedule);
  };
  
  const handleLogout = async () => {
    setUserState(prev => ({ ...prev, isAuthenticated: false, role: null, name: '' }));
    localStorage.removeItem('momple_user');
    await signOut(auth);
  };

  // Activity Handlers
  const handleWritePost = (title: string, content: string, imageUrl?: string) => {
    const isNotice = userState.role === 'admin';
    const newPost: CommunityPost = {
        id: `cp_${Date.now()}`,
        title,
        content,
        authorId: 'me',
        authorName: userState.name,
        authorBadge: isNotice ? '관리자' : '새내기맘',
        timeAgo: '방금',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isPopular: false,
        imageUrl: imageUrl,
        isNotice: isNotice
    };
    setPosts([newPost, ...posts]);
    setUserState(prev => ({ ...prev, postCount: prev.postCount + 1 }));
  };

  const handleWriteComment = () => {
    setUserState(prev => ({ ...prev, commentCount: prev.commentCount + 1 }));
  };

  // --- Guard Component for Provider Search ---
  const SearchGuard = ({ children }: { children: React.ReactElement }) => {
    const navigate = useNavigate();
    // Allow access if user has required activity OR is a partner/admin
    const isPrivileged = userState.role === 'provider' || userState.role === 'admin';
    const hasActivity = userState.postCount >= 1 && userState.commentCount >= 1;
    const hasAccess = isPrivileged || hasActivity;

    return (
      <div className={`relative ${!hasAccess ? 'h-[calc(100vh-80px)] overflow-hidden' : ''}`}>
        {/* Always render children to show the page in background */}
        <div className={!hasAccess ? 'filter blur-[1px]' : ''}>
            {children}
        </div>
        
        {/* Overlay if no access */}
        {!hasAccess && (
            <div className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-sm flex items-center justify-center p-6 h-full">
                <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col items-center text-center border border-gray-100 relative overflow-hidden animate-fade-in-up">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                    
                    {/* Icon */}
                    <div className="text-6xl mb-5">🙏</div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">앗! 잠깐!</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        깨끗한 커뮤니티 문화를 위해<br/>
                        <span className="font-bold text-primary">게시글 1개, 댓글 1개</span> 작성 후<br/>
                        이용하실 수 있습니다.
                    </p>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl w-full mb-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50">
                            <span className="text-sm font-medium text-gray-600">내 게시글</span>
                            <div className="flex items-center gap-2">
                                 <span className={`text-base font-bold ${userState.postCount > 0 ? "text-primary" : "text-gray-400"}`}>{userState.postCount}</span>
                                 <span className="text-gray-300 text-xs">/ 1</span>
                                 {userState.postCount > 0 ? <Check size={16} className="text-primary" /> : <div className="w-4 h-4 rounded-full border border-gray-300"></div>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">내 댓글</span>
                            <div className="flex items-center gap-2">
                                 <span className={`text-base font-bold ${userState.commentCount > 0 ? "text-primary" : "text-gray-400"}`}>{userState.commentCount}</span>
                                 <span className="text-gray-300 text-xs">/ 1</span>
                                 {userState.commentCount > 0 ? <Check size={16} className="text-primary" /> : <div className="w-4 h-4 rounded-full border border-gray-300"></div>}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-gray-900 text-white w-full py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all active:scale-[0.98]"
                    >
                        커뮤니티에서 활동하기
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  };

  // Render logic for content behind splash
  const renderContent = () => {
    if (!userState.isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    
    return (
      <HashRouter>
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          <Routes>
            <Route path="/" element={<HomePage userState={userState} posts={posts} />} />
            
            <Route path="/search" element={
                <SearchGuard>
                    <ProviderSearchPage userState={userState} />
                </SearchGuard>
            } />
            
            <Route path="/search-posts" element={<PostSearchPage posts={posts} />} />
            <Route path="/provider/:id" element={
                <ProviderDetailPage 
                    onWriteReview={handleWriteReview} 
                />
            } />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:id" element={<ChatRoomPage />} />
            
            <Route path="/momchin" element={
                <MomchinPage 
                    userState={userState} 
                    onToggleFollow={handleToggleFollow}
                    onUpdateProfile={handleUpdateProfile}
                />
            } />
            
            <Route path="/post/:id" element={
                <PostDetailPage 
                    posts={posts} 
                    userState={userState} 
                    onToggleFollow={handleToggleFollow} 
                    onWriteComment={handleWriteComment}
                />
            } />
            
            <Route path="/my" element={<MyPage userState={userState} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />} />
            <Route path="/notifications" element={<NotificationPage />} />

            <Route path="/provider-edit" element={<ProviderEditPage userState={userState} onUpdate={handleUpdateProviderInfo} />} />
            <Route path="/provider-ads" element={<ProviderAdsPage />} />
            <Route path="/provider-reviews" element={<ProviderReviewsPage reviews={[]} onUpdateReview={handleUpdateReview} />} />
            <Route path="/provider-points" element={<ProviderPointsPage currentPoints={userState.points} onCharge={handleCharge} />} />
            <Route path="/provider-schedule" element={<ProviderSchedulePage schedules={[]} onAddSchedule={handleAddSchedule} />} />
            <Route path="/write" element={<PostWritePage onWritePost={handleWritePost} />} />
            <Route path="/partner-subscription" element={<PartnerSubscriptionPage onSubscribe={handleSubscribe} />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <BottomNavigation />
        </div>
      </HashRouter>
    );
  };

  // 3. Show App with Splash Overlay
  return (
    <>
        {splashState !== 'hidden' && (
            <SplashScreen isFading={splashState === 'fading'} />
        )}
        {renderContent()}
    </>
  );
}

const BottomNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine if we are in a detailed view where nav should be hidden
    const isChatRoom = location.pathname.startsWith('/chat/') && location.pathname !== '/chat' && location.pathname !== '/chat/';
    const isPostDetail = location.pathname.startsWith('/post/');
    const isWritePage = location.pathname === '/write';
    const isSubscriptionPage = location.pathname === '/partner-subscription';
    const isAdminPage = location.pathname === '/admin-dashboard';

    if (isChatRoom || isPostDetail || isWritePage || isSubscriptionPage || isAdminPage) {
        return null;
    }

    const navItems = [
        { icon: <Home size={24} />, label: '커뮤니티', path: '/' },
        { icon: <SearchIcon size={24} />, label: '이모찾기', path: '/search' },
        { icon: <Send size={24} />, label: '맘친', path: '/momchin' },
        { icon: <MessageCircle size={24} />, label: '채팅', path: '/chat' },
        { icon: <User size={24} />, label: '내정보', path: '/my' }
    ];

    // Z-Index increased to 100 to stay on top of everything including modals (which usually have z-50)
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center max-w-md mx-auto z-[100] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                    <button 
                        key={idx} 
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-gray-400'}`}
                    >
                        {item.icon}
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default App;