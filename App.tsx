import React, { useState, useRef, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Siren, Share2, UserCheck, UserPlus, ThumbsUp, MessageSquareText, Send, 
  Heart, CornerDownRight, X, User, MessageCircle, Home, Search as SearchIcon, MessageSquare, Users, Menu,
  Bell, Edit3, Eye, Settings, FileText, CreditCard, ChevronRight, LogOut, Megaphone
} from 'lucide-react';

import { CommunityPost, UserState, Comment, Schedule, Review, UserRole, Notification } from './types';
import { MOCK_COMMUNITY_POSTS, MOCK_NOTIFICATIONS, FORBIDDEN_WORDS } from './constants';

import ProviderSearchPage from './components/ProviderSearchPage';
import ProviderDetailPage from './components/ProviderDetailPage';
import { ChatListPage, ChatRoomPage } from './components/ChatPages';
import MomchinPage from './components/MomchinPage';
import { ProviderEditPage, ProviderAdsPage, ProviderReviewsPage, ProviderPointsPage } from './components/ProviderBusinessPages';
import ProviderSchedulePage from './components/ProviderSchedulePage';

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

// --- Component: HomePage (Community) ---
const HomePage = ({ userState, posts }: { userState: UserState, posts: CommunityPost[] }) => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 flex justify-between items-center shadow-sm border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary">Momple</h1>
        <div className="flex gap-4 text-gray-600">
           <SearchIcon size={24} onClick={() => navigate('/search-posts')} />
           <Bell size={24} onClick={() => navigate('/notifications')} />
        </div>
      </div>

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
                            <Siren size={16} />
                            <span className="font-bold text-sm">삭제된 게시글</span>
                        </div>
                        <p className="text-xs text-gray-300">신고에 의해 블라인드 처리되었습니다.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${post.isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                {post.isPopular ? '🔥 인기' : '일상'}
                            </span>
                            <span className="font-bold text-xs text-gray-800">{post.authorName}</span>
                            <span className="text-xs text-gray-300">· {post.timeAgo}</span>
                        </div>

                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">{post.content}</p>
                        
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

// --- Component: PostSearchPage ---
const PostSearchPage = ({ posts }: { posts: CommunityPost[] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredPosts = query.trim() === '' 
    ? [] 
    : posts.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.content.toLowerCase().includes(query.toLowerCase())
      );

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack} className="text-gray-800">
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
      </div>

      <div className="p-4">
        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-300">
             <SearchIcon size={48} className="mb-4 opacity-20" />
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
             <Siren size={48} className="mb-4 opacity-20" />
             <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: NotificationPage ---
const NotificationPage = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={handleBack}><ArrowLeft size={24} /></button>
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

// --- Component: MyPage ---
const MyPage = ({ userState, onLogout }: { userState: UserState, onLogout: () => void }) => {
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
                        <p className="text-sm text-gray-500">{userState.intro || '상태메시지 없음'} · 포인트 {userState.points.toLocaleString()}P</p>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                        <Settings size={20} />
                    </button>
                </div>
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

// --- Component: PostDetailPage ---
const PostDetailPage = ({ posts, userState, onToggleFollow }: { posts: CommunityPost[], userState: UserState, onToggleFollow: (id: string) => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const initialPost = posts.find(p => p.id === id);

    const [post, setPost] = useState<CommunityPost | undefined>(initialPost);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<{ id: string, type: 'post' | 'comment' } | null>(null);

    const [comments, setComments] = useState<Comment[]>([
       { 
         id: 'c1', 
         authorName: '육아고수', 
         content: '저도 그맘 알죠 ㅠㅠ 힘내세요!', 
         timeAgo: '10분 전', 
         likeCount: 2,
         isLiked: true, 
         replies: [
            { id: 'c1_r1', authorName: '관리자', content: '공감합니다. 화이팅!', timeAgo: '5분 전', likeCount: 0 }
         ]
       },
       { id: 'c2', authorName: '관리자', content: '좋은 정보 감사합니다.', timeAgo: '방금', likeCount: 0, replies: [] }
    ]);

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    if (!post) return <div>Post not found</div>;

    const isMyPost = post.authorName === userState.name;
    const isFollowing = userState.following.includes(post.authorId);

    const handleStartChat = () => {
        const chatId = `new_dm_${post.authorId}`;
        navigate(`/chat/${chatId}`, {
            state: {
                isNewRequest: true,
                targetId: post.authorId,
                targetName: post.authorName,
                targetImage: 'https://picsum.photos/50/50',
            }
        });
        setShowProfileModal(false);
    };

    const handleReplyClick = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSendComment = () => {
        if (!commentText.trim()) return;

        const safetyCheck = checkContentSafety(commentText);
        if (!safetyCheck.safe) {
          alert(`등록할 수 없는 단어가 포함되어 있습니다: "${safetyCheck.detected}"\n비속어, 실명, 특정 업체명은 사용할 수 없습니다.`);
          return;
        }

        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            authorName: userState.name,
            content: commentText,
            timeAgo: '방금',
            likeCount: 0,
            replies: []
        };

        if (replyingTo) {
            setComments(prev => prev.map(c => {
                if (c.id === replyingTo.id) {
                    return { ...c, replies: [...(c.replies || []), newComment] };
                }
                return c;
            }));
            setReplyingTo(null);
        } else {
            setComments([...comments, newComment]);
        }
        
        setCommentText('');
    };

    const handleLikePost = () => {
        setPost(prev => {
            if (!prev) return prev;
            const newIsLiked = !prev.isLiked;
            return {
                ...prev,
                isLiked: newIsLiked,
                likeCount: newIsLiked ? prev.likeCount + 1 : prev.likeCount - 1
            };
        });
    };

    const openReportPost = () => {
        setReportTarget({ id: post.id, type: 'post' });
        setReportModalOpen(true);
    };

    const handleLikeComment = (commentId: string, parentId?: string) => {
        setComments(prev => prev.map(c => {
            if (parentId && c.id === parentId) {
                return {
                    ...c,
                    replies: c.replies?.map(r => {
                        if (r.id === commentId) {
                            const newIsLiked = !r.isLiked;
                            return { ...r, isLiked: newIsLiked, likeCount: newIsLiked ? r.likeCount + 1 : r.likeCount - 1 };
                        }
                        return r;
                    })
                };
            }
            if (!parentId && c.id === commentId) {
                const newIsLiked = !c.isLiked;
                return { ...c, isLiked: newIsLiked, likeCount: newIsLiked ? c.likeCount + 1 : c.likeCount - 1 };
            }
            return c;
        }));
    };

    const openReportComment = (commentId: string) => {
        setReportTarget({ id: commentId, type: 'comment' });
        setReportModalOpen(true);
    };

    const handleReportSubmit = (reason: string, description: string) => {
        console.log('Report Submitted:', { target: reportTarget, reason, description });
        
        if (reportTarget?.type === 'post') {
             setPost(prev => prev ? { ...prev, isReported: true } : prev);
        } else if (reportTarget?.type === 'comment') {
            setComments(prev => prev.map(c => {
                if (c.id === reportTarget.id) {
                    return { ...c, isReported: true, content: '신고 접수된 댓글입니다.' };
                }
                if (c.replies) {
                    const updatedReplies = c.replies.map(r => 
                        r.id === reportTarget.id ? { ...r, isReported: true, content: '신고 접수된 댓글입니다.' } : r
                    );
                    return { ...c, replies: updatedReplies };
                }
                return c;
            }));
        }

        setReportModalOpen(false);
        setReportTarget(null);
        alert("신고가 정상적으로 접수되었습니다.\n관리자 검토 후 조치될 예정입니다.");
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("게시글 주소가 복사되었습니다.");
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert("게시글 주소가 복사되었습니다.");
            } catch (err) {
                alert("주소 복사에 실패했습니다.");
            }
            document.body.removeChild(textArea);
        });
    };

    const handleBack = () => {
        // Prevent leaving the app if history length includes external pages
        // window.history.state.idx is 0 for the first page in the session stack
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 relative">
             <div className="sticky top-0 bg-white z-50 border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
                <button onClick={handleBack} className="p-2 -ml-2 text-gray-800 hover:bg-gray-50 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex gap-2 text-gray-600">
                    <button 
                        onClick={openReportPost} 
                        disabled={post.isReported} 
                        className={`p-2 rounded-full hover:bg-gray-50 transition-colors ${post.isReported ? "text-red-500" : ""}`}
                    >
                        <Siren size={22} />
                    </button>
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                        <Share2 size={22} />
                    </button>
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
                    {post.isReported ? <span className="text-gray-400 italic">신고 접수된 게시글입니다.</span> : post.content}
                </div>
                
                {post.imageUrl && !post.isReported && (
                    <img src={post.imageUrl} alt="post" className="w-full rounded-xl mb-6" />
                )}

                <div className="flex items-center gap-4 py-4 border-t border-gray-100 text-gray-500 text-sm font-medium">
                     <button 
                        onClick={handleLikePost}
                        className={`flex items-center gap-1 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-gray-700'}`}
                     >
                        <ThumbsUp size={18} fill={post.isLiked ? "currentColor" : "none"} /> {post.likeCount}
                     </button>
                     <button className="flex items-center gap-1 hover:text-blue-500"><MessageSquareText size={18} /> {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}</button>
                     
                     {!isMyPost && (
                        <button 
                            onClick={handleStartChat}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            <Send size={18} />
                        </button>
                     )}
                </div>
            </div>

            <div className="bg-gray-50 p-4 min-h-[200px]">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                    댓글 {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                </h3>
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-xs">{comment.authorName}</span>
                                <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
                            </div>
                            <p className={`text-xs mb-2 ${comment.isReported ? 'text-gray-400 italic' : 'text-gray-600'}`}>{comment.content}</p>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleLikeComment(comment.id)}
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Heart size={10} fill={comment.isLiked ? "currentColor" : "none"} /> {comment.likeCount}
                                </button>
                                <button 
                                    onClick={() => handleReplyClick(comment.id, comment.authorName)}
                                    className="text-[10px] text-gray-400 font-bold hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    <CornerDownRight size={10} /> 답글
                                </button>
                                <button 
                                    onClick={() => openReportComment(comment.id)}
                                    disabled={comment.isReported}
                                    className={`text-[10px] flex items-center gap-1 transition-colors ml-auto ${comment.isReported ? 'text-red-300' : 'text-gray-300 hover:text-red-500'}`}
                                >
                                    <Siren size={10} /> {comment.isReported ? '신고됨' : '신고'}
                                </button>
                            </div>

                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-2 pl-3 border-l-2 border-gray-100 space-y-2">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="bg-gray-50 p-2 rounded-lg">
                                             <div className="flex justify-between items-start mb-0.5">
                                                <span className="font-bold text-xs text-gray-700">{reply.authorName}</span>
                                                <span className="text-[10px] text-gray-400">{reply.timeAgo}</span>
                                            </div>
                                            <p className={`text-xs mb-1.5 ${reply.isReported ? 'text-gray-400 italic' : 'text-gray-600'}`}>{reply.content}</p>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleLikeComment(reply.id, comment.id)}
                                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${reply.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    <Heart size={10} fill={reply.isLiked ? "currentColor" : "none"} /> {reply.likeCount}
                                                </button>
                                                <button 
                                                    onClick={() => openReportComment(reply.id)}
                                                    disabled={reply.isReported}
                                                    className={`text-[10px] flex items-center gap-1 transition-colors ml-auto ${reply.isReported ? 'text-red-300' : 'text-gray-300 hover:text-red-500'}`}
                                                >
                                                    <Siren size={10} /> {reply.isReported ? '신고됨' : '신고'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 pb-safe z-20 max-w-md mx-auto right-0">
                {replyingTo && (
                    <div className="flex justify-between items-center mb-2 px-1 animate-fade-in">
                        <span className="text-xs text-primary font-bold">
                            @{replyingTo.name} 님에게 답글 남기는 중
                        </span>
                        <button onClick={() => setReplyingTo(null)}>
                            <X size={14} className="text-gray-400" />
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                        placeholder={replyingTo ? "답글을 입력하세요." : "댓글을 입력하세요."}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" 
                    />
                    <button 
                        onClick={handleSendComment}
                        className={`p-2 transition-colors ${commentText.trim() ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

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

            <ReportModal 
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                targetType={reportTarget?.type === 'post' ? '게시글' : '댓글'}
            />
        </div>
    );
};

// --- Main App Component ---
function App() {
  const [userState, setUserState] = useState<UserState>({
    isAuthenticated: true,
    role: 'user',
    name: '새내기맘',
    intro: '육아 초보입니다. 잘 부탁드려요!',
    points: 0,
    followerCount: 5,
    following: [],
    unlockedProviders: [],
    viewedReviews: {},
  });
  
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);

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

  const handleUpdateProfile = (updates: { intro?: string; avatar?: string }) => {
    setUserState(prev => ({ ...prev, ...updates }));
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
  
  const handleLogout = () => {
    // In a real app, clear auth tokens
    window.location.reload();
  };

  return (
    <HashRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        <Routes>
          <Route path="/" element={<HomePage userState={userState} posts={posts} />} />
          <Route path="/search" element={<ProviderSearchPage userState={userState} />} />
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
              />
          } />
          
          <Route path="/my" element={<MyPage userState={userState} onLogout={handleLogout} />} />
          <Route path="/notifications" element={<NotificationPage />} />

          <Route path="/provider-edit" element={<ProviderEditPage userState={userState} onUpdate={handleUpdateProviderInfo} />} />
          <Route path="/provider-ads" element={<ProviderAdsPage />} />
          <Route path="/provider-reviews" element={<ProviderReviewsPage reviews={[]} onUpdateReview={handleUpdateReview} />} />
          <Route path="/provider-points" element={<ProviderPointsPage currentPoints={userState.points} onCharge={handleCharge} />} />
          <Route path="/provider-schedule" element={<ProviderSchedulePage schedules={[]} onAddSchedule={handleAddSchedule} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BottomNavigation />
      </div>
    </HashRouter>
  );
}

const BottomNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Hide navigation in Chat Room, Post Detail, Provider Detail
    const hiddenPaths = ['/chat/', '/post/', '/provider/'];
    if (hiddenPaths.some(path => location.pathname.includes(path) && path !== '/chat' && path !== '/chat/')) {
        // Exception: Show nav in chat list, but hide in specific room
        if (location.pathname.startsWith('/chat/')) return null;
        if (location.pathname.startsWith('/post/')) return null;
        if (location.pathname.startsWith('/provider/')) return null;
    }

    const navItems = [
        { icon: <Home size={24} />, label: '홈', path: '/' },
        { icon: <SearchIcon size={24} />, label: '업체찾기', path: '/search' },
        { icon: <Users size={24} />, label: '맘친', path: '/momchin' },
        { icon: <MessageSquare size={24} />, label: '채팅', path: '/chat' },
        { icon: <Menu size={24} />, label: '메뉴', path: '/my' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center max-w-md mx-auto z-40 pb-safe">
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