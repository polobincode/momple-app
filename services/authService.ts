import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Kakao SDK 타입 정의 (global)
declare global {
  interface Window {
    Kakao: any;
  }
}

// === Kakao Login Configuration ===
// Kakao Developers에서 발급받은 JavaScript 키를 입력하세요.
const KAKAO_JS_KEY = "5786706c8cb357297dc6c291da60c4f6";

export const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
    console.log('Kakao SDK Initialized');
  }
};

// === Auth Functions ===

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  error?: string;
  isRedirect?: boolean; // 리다이렉트 진행 여부 확인용
}

// 1. Google Login (Mobile Friendly: Redirect 방식)
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // 모바일 환경 호환성을 위해 Popup 대신 Redirect 사용
    await signInWithRedirect(auth, provider);
    
    // 리다이렉트 시작 시점에는 user 정보가 없으므로 flag만 반환
    return { success: true, isRedirect: true };
  } catch (error: any) {
    console.error("Google Login Error:", error);
    return { success: false, error: parseAuthError(error) };
  }
};

// 1-1. Handle Google Redirect Result (앱 로드 시 호출)
export const handleGoogleRedirect = async (): Promise<AuthResult | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null; // 리다이렉트 결과가 없음 (일반 접속)

    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error: any) {
    console.error("Google Redirect Error:", error);
    return { success: false, error: parseAuthError(error) };
  }
};

// 2. Kakao Login
export const loginWithKakao = async (): Promise<AuthResult> => {
  return new Promise((resolve) => {
    initKakao();
    
    if (!window.Kakao) {
      resolve({ success: false, error: "카카오 SDK가 로드되지 않았습니다. 광고 차단 기능을 확인해주세요." });
      return;
    }

    // 모바일 웹 환경 고려
    window.Kakao.Auth.login({
      success: async (authObj: any) => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: any) => {
            const kakaoAccount = res.kakao_account;
            resolve({
              success: true,
              user: {
                uid: `kakao_${res.id}`,
                email: kakaoAccount.email,
                displayName: kakaoAccount.profile.nickname,
                photoURL: kakaoAccount.profile.profile_image_url
              }
            });
          },
          fail: (error: any) => {
            console.error('Kakao User Info Error:', error);
            resolve({ success: false, error: "사용자 정보를 불러오는데 실패했습니다." });
          },
        });
      },
      fail: (err: any) => {
        console.error('Kakao Login Fail:', err);
        if (err?.error === 'KOE009') {
          resolve({ success: false, error: "[도메인 미등록] 카카오 개발자 콘솔 > 플랫폼 > Web에 현재 도메인(vercel.app)을 등록해주세요." });
        } else {
          resolve({ success: false, error: `카카오 로그인 실패: ${JSON.stringify(err)}` });
        }
      },
    });
  });
};

// 3. Email Sign Up
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null
      }
    };
  } catch (error: any) {
    return { success: false, error: parseAuthError(error) };
  }
};

// 4. Email Login
export const loginWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error: any) {
    return { success: false, error: parseAuthError(error) };
  }
};

// Helper: Error Parser
const parseAuthError = (error: any): string => {
  const code = error.code;
  const msg = error.message;

  if (code === 'auth/unauthorized-domain') {
    return `[도메인 승인 필요]\n현재 도메인(${window.location.hostname})이 Firebase에 등록되지 않았습니다.\nFirebase 콘솔 > Authentication > Settings > Authorized Domains에 추가해주세요.`;
  }
  if (code === 'auth/popup-closed-by-user') return "로그인 창을 닫으셨습니다.";
  if (code === 'auth/popup-blocked') return "팝업이 차단되었습니다. 설정을 확인해주세요.";
  if (code === 'auth/email-already-in-use') return "이미 사용 중인 이메일입니다.";
  if (code === 'auth/weak-password') return "비밀번호는 6자리 이상이어야 합니다.";
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  
  return msg || "로그인 중 오류가 발생했습니다.";
};