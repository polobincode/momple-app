import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CommunityPost, Comment, UserState } from '../types';
import { ArrowLeft, Heart, MessageCircle, Share2, Flag, Send, Check, Megaphone, MoreHorizontal, Trash2 } from 'lucide-react';

interface PostDetailPageProps {
  posts: CommunityPost[];
  userState: UserState;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onReportPost: (postId: string) => void;
}

const PostDetailPage: React.FC<PostDetailPageProps> = ({ posts, userState, onToggleLike, onAddComment, onReportPost }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const post = posts.find(p => p.id === id);
  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg font-bold mb-2">게시글을 찾을 수 없습니다</p>
          <button onClick={() => navigate('/')} className="text-primary underline text-sm">홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const isAdmin = post.authorId === 'momple' || post.authorName === 'momple' || post.authorId === 'admin_master';

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.content.substring(0, 100), url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-800"><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">게시글</h1>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 p-1"><MoreHorizontal size={22} /></button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36 z-20">
              <button onClick={() => { handleShare(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Share2 size={14} /> 공유하기
              </button>
              <button onClick={() => { onReportPost(post.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                <Flag size={14} /> 신고하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* Notice Badge */}
          {post.isNotice && (
            <div className="flex items-center gap-1 mb-3 text-[#2AC1BC]">
              <Megaphone size={14} fill="currentColor" />
              <span className="text-xs font-bold">공지사항</span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
              {post.authorName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm">{post.authorName}</span>
                {isAdmin && (
                  <span className="text-[10px] bg-[#2AC1BC] text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                    <Check size={8} strokeWidth={4} />관리자
                  </span>
                )}
                {post.authorBadge && !isAdmin && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{post.authorBadge}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{post.timeAgo}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 mb-3 leading-snug">{post.title}</h1>

          {/* Content */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">{post.content}</p>

          {/* Image */}
          {post.imageUrl && (
            <img src={post.imageUrl} alt="post" className="w-full rounded-xl mb-4 border border-gray-100" />
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex border-y border-gray-100">
          <button
            onClick={() => onToggleLike(post.id)}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
            <span>좋아요 {post.likeCount}</span>
          </button>
          <div className="w-px bg-gray-100"></div>
          <button className="flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500">
            <MessageCircle size={18} />
            <span>댓글 {post.commentCount}</span>
          </button>
          <div className="w-px bg-gray-100"></div>
          <button onClick={handleShare} className="flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500">
            <Share2 size={18} />
            <span>공유</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-4">댓글 {post.commentCount}개</h3>
          {(!post.comments || post.comments.length === 0) ? (
            <div className="text-center py-8 text-gray-300 text-sm">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map(comment => (
                <div key={comment.id} className={`${comment.isBlinded ? 'opacity-40' : ''}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-xs text-gray-800">{comment.authorName}</span>
                        {comment.isAdmin && (
                          <span className="text-[9px] bg-[#2AC1BC] text-white px-1 py-0.5 rounded font-bold">관리자</span>
                        )}
                        <span className="text-[10px] text-gray-300">{comment.timeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {comment.isBlinded ? '신고에 의해 블라인드 처리된 댓글입니다.' : comment.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <button className="flex items-center gap-1 hover:text-red-400">
                          <Heart size={12} /> {comment.likeCount}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 pb-safe">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
          <input
            type="text"
            className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim()}
            className={`p-2 rounded-full transition-colors ${commentText.trim() ? 'text-[#2AC1BC]' : 'text-gray-400'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
