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
const KAKAO_JS_KEY = "5786706c8cb357297dc6c291da60c4f6";

// Dynamic SDK Loader
const loadKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded and valid, resolve
    if (window.Kakao && window.Kakao.Auth) {
      resolve();
      return;
    }

    // Check if script is already inserted but pending
    const existingScript = document.querySelector('script[src*="kakao.min.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Kakao SDK load failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          try {
            window.Kakao.init(KAKAO_JS_KEY);
            console.log('Kakao SDK Initialized dynamically');
          } catch (e) {
            console.error('Kakao init failed:', e);
          }
        }
        resolve();
      } else {
        reject(new Error('Kakao SDK loaded but object not found'));
      }
    };
    script.onerror = (e) => reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });
};

export const initKakao = async () => {
  try {
    await loadKakaoSDK();
  } catch (e) {
    console.error("Failed to init Kakao:", e);
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
  isRedirect?: boolean;
}

// 1. Google Login (Mobile Friendly: Redirect 방식)
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    await signInWithRedirect(auth, provider);
    
    return { success: true, isRedirect: true };
  } catch (error: any) {
    console.error("Google Login Error:", error);
    return { success: false, error: parseAuthError(error) };
  }
};

// 1-1. Handle Google Redirect Result
export const handleGoogleRedirect = async (): Promise<AuthResult | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;

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
  try {
    await loadKakaoSDK();

    if (!window.Kakao || !window.Kakao.Auth || typeof window.Kakao.Auth.login !== 'function') {
      console.error('Kakao SDK integrity check failed:', window.Kakao);
      return { success: false, error: "카카오 SDK 로드에 실패했습니다. (기능 미지원)" };
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }

    return new Promise((resolve) => {
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
                  email: kakaoAccount?.email || null,
                  displayName: kakaoAccount?.profile?.nickname || 'Kakao User',
                  photoURL: kakaoAccount?.profile?.profile_image_url || null
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
             // Mock success for development if domain is invalid
             // In production, this should show the error
             if (window.location.hostname === 'localhost') {
                 console.warn("Dev Mode: Mocking Kakao Login due to domain mismatch");
                 resolve({
                    success: true,
                    user: {
                        uid: `kakao_dev_${Date.now()}`,
                        email: 'dev@kakao.test',
                        displayName: '개발자(Kakao)',
                        photoURL: null
                    }
                 });
             } else {
                 resolve({ success: false, error: "카카오 개발자 설정에서 도메인을 등록해주세요." });
             }
          } else {
            resolve({ success: false, error: `카카오 로그인 실패: ${JSON.stringify(err)}` });
          }
        },
      });
    });
  } catch (e: any) {
    return { success: false, error: `SDK Error: ${e.message}` };
  }
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
    return `[도메인 승인 필요]\n현재 도메인(${window.location.hostname})이 Firebase에 등록되지 않았습니다.`;
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