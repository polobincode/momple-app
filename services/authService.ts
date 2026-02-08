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

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

// === Kakao Login Configuration ===
const KAKAO_JS_KEY = "5786706c8cb357297dc6c291da60c4f6";

// SDK 로딩 상태 관리 (중복 로드 방지)
let kakaoInitPromise: Promise<void> | null = null;

const loadKakaoSDK = (): Promise<void> => {
  if (kakaoInitPromise) return kakaoInitPromise;

  kakaoInitPromise = new Promise((resolve, reject) => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
          console.log('🎉 Kakao SDK Initialized');
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    
    script.onerror = (error) => {
      reject(new Error('Kakao SDK Script Load Error'));
    };

    document.head.appendChild(script);
  });

  return kakaoInitPromise;
};

// 앱 시작 시 SDK 미리 로드
export const initKakao = async () => {
  try {
    await loadKakaoSDK();
  } catch (e) {
    console.warn("Kakao SDK Preload Failed:", e);
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

// 1. Google Login
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, provider);
    return { success: true, isRedirect: true };
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
       const allowDemo = window.confirm(`[Firebase 도메인 승인 필요]\n현재 주소(${window.location.hostname})가 승인되지 않았습니다.\n체험 계정으로 진행하시겠습니까?`);
       if(allowDemo) return mockLoginResult('google');
    }
    return { success: false, error: parseAuthError(error) };
  }
};

export const handleGoogleRedirect = async (): Promise<AuthResult | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }
    };
  } catch (error: any) {
    return { success: false, error: parseAuthError(error) };
  }
};

// 2. Kakao Login (개선됨: 오류 진단 기능 추가)
export const loginWithKakao = async (): Promise<AuthResult> => {
  try {
    await loadKakaoSDK();
    
    if (!window.Kakao || !window.Kakao.Auth) {
        throw new Error("카카오 SDK가 로드되지 않았습니다.");
    }

    return new Promise((resolve) => {
      window.Kakao.Auth.login({
        success: (authObj: any) => {
          // 토큰 획득 성공 -> 사용자 정보 요청
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res: any) => {
              const kakaoAccount = res.kakao_account;
              const profile = kakaoAccount?.profile;
              
              resolve({
                success: true,
                user: {
                  uid: `kakao_${res.id}`,
                  email: kakaoAccount?.email || `${res.id}@kakao.user`,
                  displayName: profile?.nickname || 'Kakao User',
                  photoURL: profile?.profile_image_url || null
                }
              });
            },
            fail: (error: any) => {
              console.error('UserInfo Error:', error);
              // 중요: 동의항목 설정이 누락되었을 때 안내
              alert('[설정 확인 필요] 카카오 개발자 센터 > 내 애플리케이션 > 동의항목에서\n"닉네임", "프로필 사진"을 [필수 동의]로 설정해주세요.');
              resolve({ success: false, error: "사용자 정보 조회 실패 (동의항목 누락)" });
            },
          });
        },
        fail: (err: any) => {
          console.error('Login Error:', err);
          const errorCode = err.error_code || err.code;
          
          if (errorCode === 'KOE009') {
             alert(`[도메인 등록 필요]\n현재 주소(${window.location.origin})가 등록되지 않았습니다.\n카카오 개발자 센터 > 플랫폼 > Web > 사이트 도메인에 추가해주세요.`);
          } else if (errorCode === 'KOE004') {
             // 로그인 창 닫음 (오류 아님)
             resolve({ success: false, error: "로그인을 취소했습니다." });
          } else {
             alert(`카카오 로그인 오류 (${errorCode})\n${JSON.stringify(err)}`);
             resolve({ success: false, error: "로그인 실패" });
          }
        },
      });
    });
  } catch (e: any) {
    return { success: false, error: e.message || "로그인 처리 중 오류 발생" };
  }
};

// 3. Email Auth
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: null
      }
    };
  } catch (error: any) {
    return { success: false, error: parseAuthError(error) };
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      }
    };
  } catch (error: any) {
    return { success: false, error: parseAuthError(error) };
  }
};

// Helpers
const mockLoginResult = (type: string): AuthResult => ({
    success: true,
    user: {
        uid: `${type}_demo_${Date.now()}`,
        email: `demo_${type}@momple.test`,
        displayName: `체험 계정(${type})`,
        photoURL: null
    }
});

const parseAuthError = (error: any): string => {
  const code = error.code;
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password') return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (code === 'auth/email-already-in-use') return "이미 가입된 이메일입니다.";
  if (code === 'auth/weak-password') return "비밀번호는 6자리 이상이어야 합니다.";
  return "로그인 중 오류가 발생했습니다.";
};