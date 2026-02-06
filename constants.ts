
import { Provider, QualityGrade, Product, Review, ChatRoom, UserProfile, CommunityPost, Notification } from './types';

// Content Filtering List
export const FORBIDDEN_WORDS = [
  '비속어', '바보', '멍청이', '개XX', '씨XX', // Profanity examples
  '홍길동', '김철수', // Real name examples (Mock)
  '나쁜조리원', '사기업체', // Specific business defamation examples (Mock)
  '불법도박', '카지노' // Illegal promotion examples
];

export const MOCK_USERS: UserProfile[] = [
  { id: 'u_official', name: 'Momple_Official', avatar: 'https://picsum.photos/50/50?random=20', isFollowingMe: false, intro: '맘플 공식 계정입니다. 공지사항을 확인하세요.' },
  { id: 'u_expert', name: '육아고수', avatar: 'https://picsum.photos/50/50?random=22', isFollowingMe: true, intro: '육아 3년차, 꿀팁 공유해요 👶' },
  { id: 'u_love', name: '사랑맘', avatar: 'https://picsum.photos/50/50?random=90', isFollowingMe: true, intro: '사랑이와 함께하는 행복한 일상' },
  { id: 'u_happy', name: '행복파파', avatar: 'https://picsum.photos/50/50?random=91', isFollowingMe: false, intro: '아빠 육아 화이팅! 소통 환영합니다.' },
  { id: 'u_new', name: '새내기맘', avatar: 'https://picsum.photos/50/50?random=92', isFollowingMe: false, intro: '이제 막 엄마가 되었어요. 잘 부탁드려요.' },
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'cp1',
    title: '몸이 너무 뻐근한데 마사지샵 추천 좀 부탁드려요 ㅠㅠ',
    content: '출산한지 3개월 됐는데 온몸이 얻어맞은 것처럼 아프네요. 정상적인 관리를 받을 수 있는 샵이 있을까요? 몸을 제대로 주물러주는 곳이었으면 좋겠어... 강남구 쪽으로 추천 부탁드립니다.',
    authorId: 'u_new',
    authorName: '새내기맘',
    authorBadge: '3개월차',
    authorFollowerCount: 12,
    timeAgo: '방금',
    viewCount: 124,
    likeCount: 5,
    commentCount: 12,
    isPopular: false
  },
  {
    id: 'cp2',
    title: '🔥 이번주 베이비페어 가시는 분 계신가요?',
    content: '코엑스에서 하는 베이비페어 이번에 규모가 꽤 크다고 하던데 가보신 분들 후기 좀 알려주세요. 유모차 보러 가려고 하는데 사람이 너무 많을까봐 걱정입니다.',
    authorId: 'u_happy',
    authorName: '열혈파파',
    authorBadge: '예비아빠',
    authorFollowerCount: 45,
    timeAgo: '1시간 전',
    viewCount: 850,
    likeCount: 42,
    commentCount: 28,
    isPopular: true,
    imageUrl: 'https://picsum.photos/400/200?random=50'
  },
  {
    id: 'cp3',
    title: '산후도우미 업체 선정할 때 꿀팁 공유합니다',
    content: '첫째 때 실패하고 둘째 때는 꼼꼼하게 골랐더니 성공했어요. 1. 정부등급 꼭 확인하기 2. 후기 사진 자세히 보기 3. 전화 상담시 체크리스트... (더보기)',
    authorId: 'u_expert',
    authorName: '육아고수',
    authorBadge: '다둥이맘',
    authorFollowerCount: 1250,
    timeAgo: '3시간 전',
    viewCount: 2100,
    likeCount: 156,
    commentCount: 45,
    isPopular: true
  },
  {
    id: 'cp4',
    title: '이유식 거부.. 어떻게 해야 할까요?',
    content: '이제 6개월인데 미음 밷어내기 바쁘네요 ㅠㅠ 입을 꾹 다물고 안 여는데 억지로라도 먹여야 할까요? 선배님들의 조언이 필요합니다.',
    authorId: 'u_love',
    authorName: '초보맘',
    authorBadge: '6개월차',
    authorFollowerCount: 8,
    timeAgo: '5시간 전',
    viewCount: 340,
    likeCount: 8,
    commentCount: 15,
    isPopular: false
  },
  {
    id: 'cp5',
    title: '남편이랑 육아 분담 어떻게 하시나요?',
    content: '퇴근하고 오면 힘들다고 누워만 있는데 화가 나네요. 독박육아 너무 힘들어요. 현명하게 대처하는 방법 없을까요?',
    authorId: 'u_new',
    authorName: '지친맘',
    authorBadge: '12개월차',
    authorFollowerCount: 2,
    timeAgo: '하루 전',
    viewCount: 560,
    likeCount: 23,
    commentCount: 34,
    isPopular: false
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u_love',
    userName: '사랑맘',
    content: '이모님이 너무 친절하시고 음식 솜씨가 좋으셨어요. 강력 추천합니다!',
    rating: 5,
    date: '2023-10-01',
    images: ['https://picsum.photos/200/200'],
    isVerified: true
  },
  {
    id: 'r2',
    userId: 'u_happy',
    userName: '행복파파',
    content: '처음에는 걱정했는데 전문가답게 아이를 잘 케어해주셨습니다.',
    rating: 4,
    date: '2023-09-28',
    images: ['https://picsum.photos/201/201'],
    isVerified: false
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: '둥이맘',
    content: '쌍둥이라 힘드셨을 텐데 내색 없이 잘 해주셔서 감사합니다. 다만 시간 약속이 조금 아쉬웠어요.',
    rating: 3,
    date: '2023-09-15',
    isVerified: true
  },
  {
    id: 'r4',
    userId: 'u4',
    userName: '초보엄마',
    content: '정말 좋았습니다. 둘째 낳으면 또 이용하고 싶어요.',
    rating: 5,
    date: '2023-09-10',
    isVideo: true,
    images: ['https://picsum.photos/202/202'],
    isVerified: false
  }
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: '해피맘 산후조리',
    location: '강남구 역삼동',
    description: '프리미엄 산후 관리 서비스, 1:1 맞춤 케어',
    grade: QualityGrade.A,
    yearsActive: 12,
    isVerified: true,
    isAd: true,
    reviews: MOCK_REVIEWS,
    imageUrl: 'https://picsum.photos/500/300?random=1',
    priceStart: 1500000,
    phoneNumber: '02-555-1234'
  },
  {
    id: 'p2',
    name: '아가사랑 돌봄',
    location: '서초구 반포동',
    description: '정부 지원 바우처 사용 가능, 친절한 서비스',
    grade: QualityGrade.A,
    yearsActive: 6,
    isVerified: true,
    isAd: false,
    reviews: [MOCK_REVIEWS[0], MOCK_REVIEWS[2]],
    imageUrl: 'https://picsum.photos/500/300?random=2',
    priceStart: 1200000,
    phoneNumber: '02-123-4567'
  },
  {
    id: 'p3',
    name: '새싹 케어',
    location: '송파구 잠실동',
    description: '신규 오픈! 열정적인 관리사님 대기 중',
    grade: QualityGrade.B,
    yearsActive: 1,
    isVerified: false,
    isAd: false,
    reviews: [MOCK_REVIEWS[1]],
    imageUrl: 'https://picsum.photos/500/300?random=3',
    priceStart: 1100000,
    phoneNumber: '02-987-6543'
  },
  {
    id: 'p4',
    name: '마음 편한 세상',
    location: '강남구 논현동',
    description: '10년 이상의 베테랑 관리사만 배정합니다.',
    grade: QualityGrade.C, // Example for icon logic
    yearsActive: 15,
    isVerified: true,
    isAd: false,
    reviews: [...MOCK_REVIEWS, ...MOCK_REVIEWS],
    imageUrl: 'https://picsum.photos/500/300?random=4',
    priceStart: 1800000,
    phoneNumber: '02-111-2222'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'pr1',
    title: '아기침대 팝니다 (상태 A급)',
    price: 50000,
    location: '역삼1동',
    imageUrl: 'https://picsum.photos/300/300?random=10',
    timeAgo: '10분 전',
    likes: 5
  },
  {
    id: 'pr2',
    title: '유모차 무료 나눔해요',
    price: 0,
    location: '논현동',
    imageUrl: 'https://picsum.photos/300/300?random=11',
    timeAgo: '1시간 전',
    likes: 12
  },
  {
    id: 'pr3',
    title: '미개봉 분유 3단계',
    price: 25000,
    location: '반포동',
    imageUrl: 'https://picsum.photos/300/300?random=12',
    timeAgo: '2시간 전',
    likes: 2
  },
  {
    id: 'pr4',
    title: '국민 모빌 타이니러브',
    price: 15000,
    location: '잠실본동',
    imageUrl: 'https://picsum.photos/300/300?random=13',
    timeAgo: '하루 전',
    likes: 8
  }
];

export const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'c1',
    type: 'provider',
    targetId: 'p1',
    targetName: '해피맘 산후조리',
    targetImage: 'https://picsum.photos/500/300?random=1',
    lastMessage: '네, 12월 예약 가능하십니다. 날짜를 알려주세요.',
    lastMessageTime: '방금 전',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'me', text: '안녕하세요, 12월 초 예약 가능한가요?', timestamp: '오전 10:00' },
      { id: 'm2', senderId: 'p1', text: '안녕하세요 해피맘입니다 :)', timestamp: '오전 10:05' },
      { id: 'm3', senderId: 'p1', text: '네, 12월 예약 가능하십니다. 날짜를 알려주세요.', timestamp: '오전 10:06' }
    ]
  },
  {
    id: 'c2',
    type: 'market',
    targetId: 'pr1',
    targetName: '아기침대 팝니다',
    targetImage: 'https://picsum.photos/300/300?random=10',
    lastMessage: '네고 가능한가요?',
    lastMessageTime: '1시간 전',
    unreadCount: 0,
    messages: [
       { id: 'm1', senderId: 'me', text: '안녕하세요 물건 아직 있나요?', timestamp: '어제' },
       { id: 'm2', senderId: 'pr1', text: '네 아직 있습니다.', timestamp: '어제' },
       { id: 'm3', senderId: 'me', text: '네고 가능한가요?', timestamp: '1시간 전' }
    ]
  },
  {
    id: 'c3',
    type: 'dm',
    targetId: 'u_expert',
    targetName: '육아고수',
    targetImage: 'https://picsum.photos/50/50?random=22',
    lastMessage: '이유식 정보 감사합니다!',
    lastMessageTime: '어제',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'u_expert', text: '반가워요! 육아 소통해요~', timestamp: '어제' },
      { id: 'm2', senderId: 'me', text: '이유식 정보 감사합니다!', timestamp: '어제' }
    ]
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'comment', content: "'육아고수'님이 회원님의 글에 댓글을 남겼습니다: \"저도 궁금해요!\"", timeAgo: '방금 전', isRead: false, targetPath: '/post/cp1' },
  { id: 'n2', type: 'like', content: "'사랑맘'님이 회원님의 글을 좋아합니다.", timeAgo: '10분 전', isRead: false, targetPath: '/post/cp1' },
  { id: 'n3', type: 'notice', content: '맘플 서비스 점검 안내 (12/25 00:00~02:00)', timeAgo: '1일 전', isRead: true },
  { id: 'n4', type: 'comment', content: "'행복파파'님이 댓글을 남겼습니다.", timeAgo: '2일 전', isRead: true, targetPath: '/post/cp2' },
];
