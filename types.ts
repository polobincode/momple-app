
export enum QualityGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  Unrated = 'Unrated'
}

export enum YearsActive {
  New = 'New',
  FivePlus = '5+',
  TenPlus = '10+'
}

export type UserRole = 'user' | 'provider' | 'admin';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  date: string;
  images?: string[];
  isVideo?: boolean;
  isVerified?: boolean; // Verified purchase badge
  isBlinded?: boolean; // New: Report status
  isBest?: boolean; // New: Selected as Best Review by provider
  reply?: { // New: Provider's reply
    content: string;
    date: string;
  };
}

export interface Provider {
  id: string;
  name: string;
  location: string;
  description: string;
  grade: QualityGrade;
  yearsActive: number;
  isVerified: boolean;
  isAd: boolean;
  reviews: Review[];
  imageUrl: string;
  priceStart: number;
  phoneNumber?: string; // Added phone number
}

export interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  timeAgo: string;
  likes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isFollowingMe: boolean; // Simulates if this user follows the current user
  intro: string;
}

// New Type for Community Board (Blind Style)
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string; // Added authorId for follow feature
  authorName: string;
  authorBadge?: string; // e.g., '새내기맘', '인증업체'
  authorFollowerCount?: number; // Added follower count
  timeAgo: string;
  viewCount: number;
  likeCount: number;
  isLiked?: boolean; // New: Current user liked status
  isReported?: boolean; // New: Current user reported status
  commentCount: number;
  imageUrl?: string;
  isPopular?: boolean;
  isBlinded?: boolean; // New: Report status
  isNotice?: boolean; // New: Notice post status
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timeAgo: string;
  likeCount: number;
  isLiked?: boolean; // New: Current user liked status
  isReported?: boolean; // New: Current user reported status
  isBlinded?: boolean;
  replies?: Comment[]; // New: Nested comments (replies)
  isAdmin?: boolean; // New: Identifies if the comment is from an admin
}

export interface Schedule {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  customerName: string;
  serviceType: string;
  status: 'confirmed' | 'pending' | 'completed';
  note?: string;
}

export interface UserState {
  isAuthenticated: boolean;
  role: UserRole | null;
  name: string;
  intro?: string; // New field for status message
  avatar?: string; // New field for profile picture
  babyName?: string; // New field for "00이 맘"
  lastNicknameChangeDate?: string; // New field for monthly limit check
  points: number;
  followerCount: number; // New: Follower count for My Page
  following: string[]; // List of IDs I follow
  postCount: number; // New: Track number of posts created
  commentCount: number; // New: Track number of comments created
  unlockedProviders: string[];
  viewedReviews: Record<string, number>;
  // Provider specific
  providerInfo?: {
    id?: string; // Added ID link
    businessName: string;
    businessRegNo: string;
    description: string;
    imageUrl: string;
    phoneNumber?: string;
  };
  // Partner Subscription
  subscription?: {
    status: 'trial' | 'active' | 'expired';
    expiryDate: string; // ISO Date String
  };
}

// --- Chat Types ---
export type ChatType = 'provider' | 'market' | 'dm';
export type MessageType = 'text' | 'image' | 'system' | 'booking';
export type ChatStatus = 'active' | 'pending' | 'rejected'; // New status for DM request

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or other
  text: string;
  timestamp: string;
  type?: MessageType;
  expiresAt?: number; // Timestamp for auto-delete
  bookingInfo?: {
    date: string;
    time: string;
    service: string;
  };
}

export interface ChatRoom {
  id: string;
  type: ChatType;
  targetId: string; // providerId, productId, or userId
  targetName: string;
  targetImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  status?: ChatStatus; // Status for DM acceptance flow
}

// --- Notification Types ---
export type NotificationType = 'like' | 'comment' | 'notice';

export interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  timeAgo: string;
  isRead: boolean;
  targetPath?: string;
}

// --- Admin Types ---
export interface PartnerRequest {
  id: string;
  businessName: string;
  businessNo: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReportItem {
  id: string;
  targetType: 'post' | 'comment' | 'review';
  targetId: string; // Link to actual content
  reason: string;
  reporter: string;
  contentSnippet: string;
  status: 'pending' | 'blinded' | 'dismissed';
}
