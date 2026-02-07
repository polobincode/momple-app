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
// 실제 운영 시 Kakao Developers에서 플랫폼 > Web 사이트 도메인을 등록해야 합니다.
const KAKAO_JS_KEY = "5786706c8cb357297dc6c291da60c4f6";

// Dynamic SDK Loader
const loadKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 1. 이미 로드되어 있고 초기화된 경우
    if (window.Kakao && window.Kakao.isInitialized()) {
      resolve();
      return;
    }

    // 2. 스크립트가 이미 삽입되었는지 확인
    const existingScript = document.querySelector('script[src*="kakao.min.js"]');
    if (existingScript) {
      // 이미 로드 중이면 onload 이벤트를 기다리거나 바로 해결
      // (간단하게 처리하기 위해 기존 스크립트가 있으면 완료된 것으로 간주하되, 초기화 체크)
      if (window.Kakao) resolve();
      else existingScript.addEventListener('load', () => resolve());
      return;
    }

    // 3. 스크립트 삽입
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          try {
            window.Kakao.init(KAKAO_JS_KEY);
            console.log('Kakao SDK Initialized');
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

// 앱 시작 시 호출하여 미리 로드
export const initKakao = async () => {
  try {
    await loadKakaoSDK();
  } catch (e) {
    console.warn("Failed to preload Kakao SDK:", e);
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
    
    // 리다이렉트가 시작되면 이 함수는 중단되거나 페이지가 이동됩니다.
    return { success: true, isRedirect: true };
  } catch (error: any) {
    console.error("Google Login Error:", error);
    
    // [개발/데모 환경 예외 처리]
    // Firebase Console에서 도메인이 승인되지 않았거나(auth/unauthorized-domain),
    // 팝업/리다이렉트가 차단된 경우, 데모 환경에서는 모의 로그인을 허용합니다.
    const isDevOrDemo = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname.includes('vercel.app');

    if (isDevOrDemo) {
       console.warn("Demo Mode: Mocking Google Login due to error/config issue:", error.code);
       return {
          success: true,
          isRedirect: false, // 즉시 로그인 처리
          user: {
              uid: `google_demo_${Date.now()}`,
              email: 'demo_google@momple.test',
              displayName: '체험용 계정(Google)',
              photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c' // Generic Google Icon
          }
       };
    }

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
    // SDK 로드 확인
    await loadKakaoSDK();

    if (!window.Kakao || !window.Kakao.Auth) {
      return { success: false, error: "카카오 SDK를 불러올 수 없습니다." };
    }

    return new Promise((resolve) => {
      window.Kakao.Auth.login({
        success: async (authObj: any) => {
          // 로그인 성공 시 사용자 정보 요청
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res: any) => {
              const kakaoAccount = res.kakao_account;
              const profile = kakaoAccount?.profile;
              
              resolve({
                success: true,
                user: {
                  uid: `kakao_${res.id}`,
                  email: kakaoAccount?.email || `${res.id}@kakao.user`, // 이메일이 없을 경우 ID로 대체
                  displayName: profile?.nickname || 'Kakao User',
                  photoURL: profile?.profile_image_url || null
                }
              });
            },
            fail: (error: any) => {
              console.error('Kakao User Info Error:', error);
              resolve({ success: false, error: "카카오 사용자 정보를 불러오는데 실패했습니다." });
            },
          });
        },
        fail: (err: any) => {
          console.error('Kakao Login Fail:', err);
          
          // [개발/데모 환경 예외 처리]
          // 도메인이 등록되지 않아 KOE009 에러가 발생할 경우 (Localhost 또는 Vercel 데모)
          // 개발 편의를 위해 모의 로그인 성공 처리
          const isDevOrDemo = 
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.includes('vercel.app');

          if (err?.error === 'KOE009' && isDevOrDemo) {
             console.warn("Demo Mode: Mocking Kakao Login due to domain mismatch (KOE009)");
             resolve({
                success: true,
                user: {
                    uid: `kakao_dev_${Date.now()}`,
                    email: 'demo_user@momple.test',
                    displayName: '체험용 계정(Kakao)',
                    photoURL: null
                }
             });
          } else {
            resolve({ success: false, error: "카카오 로그인에 실패했습니다. (팝업 차단 여부를 확인해주세요)" });
          }
        },
      });
    });
  } catch (e: any) {
    console.error(e);
    return { success: false, error: `로그인 처리 중 오류 발생: ${e.message}` };
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