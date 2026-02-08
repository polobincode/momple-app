
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X, Megaphone } from 'lucide-react';

interface PostWritePageProps {
  onWritePost: (title: string, content: string, imageUrl?: string, isNotice?: boolean) => void;
}

const PostWritePage: React.FC<PostWritePageProps> = ({ onWritePost }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isNotice, setIsNotice] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    onWritePost(title, content, imagePreview || undefined, isNotice);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative z-[200]">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">글쓰기</h1>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
            title.trim() && content.trim() 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          완료
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex items-center justify-end mb-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isNotice ? 'bg-[#2AC1BC] border-[#2AC1BC]' : 'bg-white border-gray-300'}`}>
                    {isNotice && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isNotice} 
                    onChange={(e) => setIsNotice(e.target.checked)} 
                />
                <span className={`text-sm font-bold flex items-center gap-1 ${isNotice ? 'text-[#2AC1BC]' : 'text-gray-400'}`}>
                    <Megaphone size={14} /> 공지사항으로 등록
                </span>
            </label>
        </div>

        <input 
          type="text" 
          placeholder="제목을 입력하세요" 
          className="w-full text-lg font-bold placeholder-gray-400 outline-none mb-6 bg-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        
        <textarea 
          placeholder="내용을 입력하세요.&#13;&#10;육아 고민, 정보 공유, 일상 이야기 등 자유롭게 나눠보세요." 
          className="w-full h-[calc(100vh-300px)] text-base leading-relaxed placeholder-gray-400 outline-none resize-none bg-transparent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {imagePreview && (
          <div className="relative mt-4 w-full rounded-xl overflow-hidden border border-gray-100">
             <img src={imagePreview} alt="preview" className="w-full max-h-60 object-cover" />
             <button 
               onClick={() => setImagePreview(null)}
               className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
             >
               <X size={16} />
             </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 border-t border-gray-100 bg-white pb-safe sticky bottom-0">
        <label className="flex items-center gap-2 cursor-pointer w-fit p-2 hover:bg-gray-50 rounded-lg transition-colors">
           <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Camera size={18} />
           </div>
           <span className="text-sm font-medium text-gray-600">사진 추가</span>
           <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>
    </div>
  );
};

export default PostWritePage;
