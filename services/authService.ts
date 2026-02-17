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

// === Auth Functions ===

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: string;
  };
  error?: string;
  isRedirect?: boolean;
}

// 1. Google Login (팝업 방식 우선, 실패 시 리다이렉트 폴백)
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // 팝업 방식 우선 시도 (더 나은 UX)
    try {
      const result = await signInWithPopup(auth, provider);
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        }
      };
    } catch (popupError: any) {
      // 팝업 차단 시 리다이렉트 방식으로 폴백
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return { success: true, isRedirect: true };
      }
      throw popupError;
    }
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

// 2. Email Auth
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
  if (code === 'auth/invalid-credential') return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (code === 'auth/email-already-in-use') return "이미 가입된 이메일입니다.";
  if (code === 'auth/weak-password') return "비밀번호는 6자리 이상이어야 합니다.";
  if (code === 'auth/invalid-email') return "유효하지 않은 이메일 형식입니다.";
  if (code === 'auth/too-many-requests') return "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
  return "로그인 중 오류가 발생했습니다.";
};
