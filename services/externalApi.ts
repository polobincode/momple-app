
import { MOCK_PROVIDERS } from '../constants';
import { Provider, QualityGrade } from '../types';

// ============================================================================
// [API 설정] - 사회서비스 전자바우처 OpenAPI
// ============================================================================

const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';

// API 기본 경로 (Vite Proxy 또는 Vercel Serverless)
const getIsDev = (): boolean => {
  try {
    const env = (import.meta as any).env;
    return (env && env.DEV) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  } catch {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
};

// ============================================================================
// 1. 사업자등록정보 진위확인 (Mock 유지)
// ============================================================================
export const verifyBusinessNumber = async (businessNo: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const cleanNum = businessNo.replace(/-/g, '');
  return cleanNum.length === 10;
};

// ============================================================================
// 2. 품질평가 정보 조회 (qualityList API)
// ============================================================================
interface QualityInfo {
  providerName: string;
  grade: string;
  evaluationYear: string;
}

// 품질평가 캐시 (세션 동안 유지)
let qualityCache: Map<string, QualityGrade> | null = null;

const fetchQualityGrades = async (): Promise<Map<string, QualityGrade>> => {
  if (qualityCache) return qualityCache;

  const isDev = getIsDev();
  const cache = new Map<string, QualityGrade>();

  try {
    const queryParams = `?ServiceKey=${GOV_API_KEY}&numOfRows=500&pageNo=1`;
    let apiUrl = '';

    if (isDev) {
      apiUrl = `/gov-api/api/service/quality/qualityList${queryParams}`;
    } else {
      apiUrl = `/api/gov-proxy?type=quality`;
    }

    console.log(`[품질평가 API] Fetching: ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    if (!text.includes('<response>')) throw new Error('Invalid XML response');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const items = xmlDoc.getElementsByTagName('item');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = item.getElementsByTagName('providerName')[0]?.textContent?.trim() || '';
      const gradeStr = item.getElementsByTagName('qualityGrade')[0]?.textContent?.trim()
                    || item.getElementsByTagName('grade')[0]?.textContent?.trim() || '';

      if (name) {
        let grade = QualityGrade.Unrated;
        const g = gradeStr.toUpperCase();
        if (g === 'A' || g === '가' || g === '최우수') grade = QualityGrade.A;
        else if (g === 'B' || g === '나' || g === '우수') grade = QualityGrade.B;
        else if (g === 'C' || g === '다' || g === '보통') grade = QualityGrade.C;
        else if (g === 'D' || g === '라') grade = QualityGrade.D;
        else if (g === 'F' || g === '마' || g === '미흡') grade = QualityGrade.F;

        cache.set(name, grade);
      }
    }

    console.log(`[품질평가 API] ${cache.size}개 업체 등급 로드 완료`);
    qualityCache = cache;
  } catch (error: any) {
    console.warn("[품질평가 API] 조회 실패 (Mock fallback):", error.message);
    // 품질평가 API 연결 실패 시 빈 캐시 반환
  }

  return cache;
};

// 업체명으로 품질등급 매칭 (부분 일치 지원)
const matchQualityGrade = (providerName: string, gradeMap: Map<string, QualityGrade>): QualityGrade => {
  // 1. 정확 매칭
  if (gradeMap.has(providerName)) return gradeMap.get(providerName)!;

  // 2. 부분 매칭 (업체명이 포함된 경우)
  for (const [key, grade] of gradeMap) {
    if (providerName.includes(key) || key.includes(providerName)) {
      return grade;
    }
  }

  return QualityGrade.Unrated;
};

// ============================================================================
// 3. 산후도우미 업체 검색 (providerList API + 품질평가 연동)
// ============================================================================
export const searchProvidersFromGov = async (query: string): Promise<{ data: Provider[], status: string, isMock: boolean, apiConnected: boolean }> => {

  let xmlText: string | null = null;
  let statusMessage = '';
  let apiConnected = false;

  // 품질평가 데이터 미리 로드 (병렬)
  const qualityPromise = fetchQualityGrades();

  try {
    const isDev = getIsDev();
    let apiUrl = '';

    const queryParams = `?ServiceKey=${GOV_API_KEY}&numOfRows=100&pageNo=1`;

    if (isDev) {
      apiUrl = `/gov-api/api/service/provider/providerList${queryParams}`;
      if (query) apiUrl += `&providerName=${encodeURIComponent(query)}`;
    } else {
      apiUrl = `/api/gov-proxy?query=${encodeURIComponent(query)}`;
    }

    console.log(`[제공기관 API] Fetching (${isDev ? 'Local Proxy' : 'Vercel Function'}): ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Proxy returned JSON error");
      }
      xmlText = await response.text();
      apiConnected = true;
      statusMessage = '공공데이터 API 연동 성공';
    } else {
      if (response.status === 404 && isDev) {
        console.error("[제공기관 API] 404 Error: Vite 개발 서버 재시작 필요 (vite.config.ts 변경 적용)");
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

  } catch (error: any) {
    console.warn("[제공기관 API] 호출 실패 (Mock fallback):", error.message);
    statusMessage = `API 연결 실패: ${error.message || 'TimeOut'}`;
  }

  // 품질평가 데이터 대기
  const gradeMap = await qualityPromise;

  // --- XML 파싱 ---
  if (xmlText && !xmlText.includes('<errMsg>') && xmlText.includes('<response>')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // 결과 코드 확인
      const resultCode = xmlDoc.getElementsByTagName('resultCode')[0]?.textContent;
      if (resultCode && resultCode !== '00') {
        const resultMsg = xmlDoc.getElementsByTagName('resultMsg')[0]?.textContent || 'Unknown error';
        throw new Error(`API Error: ${resultCode} - ${resultMsg}`);
      }

      const items = xmlDoc.getElementsByTagName('item');

      if (items.length > 0) {
        const apiProviders: Provider[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          const name = item.getElementsByTagName('providerName')[0]?.textContent?.trim() || '이름 없음';
          const addr = item.getElementsByTagName('address')[0]?.textContent?.trim()
                    || item.getElementsByTagName('loadAddress')[0]?.textContent?.trim()
                    || '주소 정보 없음';
          const phone = item.getElementsByTagName('telNumber')[0]?.textContent?.trim() || '';
          const serviceName = item.getElementsByTagName('serviceName')[0]?.textContent?.trim() || '사회서비스 제공기관';
          const userCountStr = item.getElementsByTagName('userCount')[0]?.textContent?.trim() || '0';
          const establishYear = item.getElementsByTagName('establishYear')[0]?.textContent?.trim() || '';

          // 품질평가 등급 매칭
          const grade = matchQualityGrade(name, gradeMap);

          // 이용자 수
          const userCount = parseInt(userCountStr, 10) || Math.floor(Math.random() * 500) + 10;

          // 운영 기간 계산
          let yearsActive = 0;
          if (establishYear) {
            yearsActive = new Date().getFullYear() - parseInt(establishYear, 10);
            if (yearsActive < 0) yearsActive = 0;
          } else {
            yearsActive = Math.floor(Math.random() * 8) + 1;
          }

          apiProviders.push({
            id: `gov_${i}_${Date.now()}`,
            name,
            location: addr,
            description: serviceName,
            grade,
            yearsActive,
            userCount,
            isVerified: false,
            isAd: false,
            reviews: [],
            imageUrl: `https://picsum.photos/500/300?random=${i + 600}`,
            priceStart: 0,
            phoneNumber: phone
          });
        }

        if (apiProviders.length > 0) {
          const gradeCount = apiProviders.filter(p => p.grade !== QualityGrade.Unrated).length;
          statusMessage += gradeCount > 0
            ? ` (품질평가 ${gradeCount}건 연동)`
            : ' (품질평가 데이터 매칭 없음)';
          return { data: apiProviders, status: statusMessage, isMock: false, apiConnected };
        }
      }
    } catch (e: any) {
      console.error("[XML 파싱 오류]", e);
      statusMessage = `데이터 파싱 오류: ${e.message}`;
    }
  }

  // ============================================================================
  // [Fallback] Mock Data (API 연결 실패 시)
  // ============================================================================

  const fallbackData = query
    ? MOCK_PROVIDERS.filter(p => p.name.includes(query) || p.location.includes(query))
    : MOCK_PROVIDERS;

  if (fallbackData.length < 3 && query.length > 1) {
    const demoProviders: Provider[] = [];
    const city = query.length >= 2 ? query.substring(0, 2) : '서울';

    for (let i = 1; i <= 3; i++) {
      demoProviders.push({
        id: `mock_gen_${i}_${Date.now()}`,
        name: `${query} ${i}호점 사랑맘케어`,
        location: `${city} 행복구 희망동 ${i}0${i}번지`,
        description: '정부바우처 사용 가능, 전문 관리사 상주',
        grade: i === 1 ? QualityGrade.A : QualityGrade.B,
        yearsActive: i * 3,
        userCount: 300 * i,
        isVerified: i === 1,
        isAd: false,
        reviews: [],
        imageUrl: `https://picsum.photos/500/300?random=${2000 + i}`,
        priceStart: 1300000,
        phoneNumber: '010-1234-5678'
      });
    }
    return {
      data: [...fallbackData, ...demoProviders],
      status: `체험 데이터 (API 미연결)`,
      isMock: true,
      apiConnected: false
    };
  }

  return {
    data: fallbackData,
    status: fallbackData.length > 0 ? '체험 데이터 표시 (API 미연결)' : '검색 결과 없음',
    isMock: true,
    apiConnected: false
  };
};

// ============================================================================
// [유틸] 소셜 로그인 (Mock)
// ============================================================================
export const loginWithSocial = async (provider: 'kakao' | 'google' | 'apple') => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    token: 'mock_jwt_token',
    user: { name: '새내기맘', email: `user@${provider}.com` }
  };
};
