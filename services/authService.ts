import { 
  signInWithPopup, 
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
}

// 1. Google Login
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    // 계정 선택창을 강제로 띄워 자동 로그인 오류 방지
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
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
    console.error("Google Login Error Code:", error.code);
    console.error("Google Login Error Message:", error.message);
    
    let errorMessage = "로그인 중 오류가 발생했습니다.";

    // 구글 로그인 실패 유형별 안내
    if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `[도메인 승인 필요]\n현재 도메인(${window.location.hostname})이 Firebase에 등록되지 않았습니다.\nFirebase 콘솔 > Authentication > Settings > Authorized Domains에 추가해주세요.`;
    } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "로그인 창을 닫으셨습니다. 다시 시도해주세요.";
    } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.";
    } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google 로그인이 비활성화 상태입니다. Firebase 콘솔에서 Google 로그인 공급업체를 '사용 설정' 해주세요.";
    } else if (error.message) {
        errorMessage = `로그인 실패: ${error.message}`;
    }

    return { success: false, error: errorMessage };
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

    window.Kakao.Auth.login({
      success: async (authObj: any) => {
        // 토큰을 받으면 사용자 정보 요청
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
        // KOE009: Unregistered site domain
        if (err?.error === 'KOE009') {
          resolve({ success: false, error: "도메인 등록이 필요합니다. 카카오 개발자 사이트 > 플랫폼 > Web에 현재 도메인을 등록해주세요." });
        } else {
          resolve({ success: false, error: JSON.stringify(err) });
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
    
    // Update Display Name
    await updateProfile(user, { displayName: name });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name, // Use the name provided
        photoURL: null
      }
    };
  } catch (error: any) {
    let msg = "회원가입 실패";
    if (error.code === 'auth/email-already-in-use') msg = "이미 사용 중인 이메일입니다.";
    if (error.code === 'auth/weak-password') msg = "비밀번호는 6자리 이상이어야 합니다.";
    return { success: false, error: msg };
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
    let msg = "로그인 실패";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      msg = "이메일 또는 비밀번호가 올바르지 않습니다.";
    }
    return { success: false, error: msg };
  }
};
