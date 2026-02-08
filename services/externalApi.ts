
import { MOCK_PROVIDERS } from '../constants';
import { Provider, QualityGrade } from '../types';

// ============================================================================
// [API 설정]
// ============================================================================

const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';

// ============================================================================
// 1. 사업자등록정보 진위확인 (Mock 유지)
// ============================================================================
export const verifyBusinessNumber = async (businessNo: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  const cleanNum = businessNo.replace(/-/g, '');
  return cleanNum.length === 10;
};

// ============================================================================
// 2. 산후도우미 업체 검색
// ============================================================================
export const searchProvidersFromGov = async (query: string): Promise<{ data: Provider[], status: string, isMock: boolean }> => {
  
  // --- 실제 API 로직 ---
  let xmlText: string | null = null;
  let statusMessage = '';
  
  try {
    // [수정] 환경 감지 로직 강화 (Safe Access)
    // Vite 환경 변수(import.meta.env)가 없거나 접근 실패 시에도 멈추지 않도록 처리
    let isDev = false;
    try {
        const env = (import.meta as any).env;
        isDev = (env && env.DEV) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    } catch (e) {
        // Fallback check
        isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    
    let apiUrl = '';
    
    // [수정] 명세서 기준 파라미터
    const queryParams = `?ServiceKey=${GOV_API_KEY}&numOfRows=100&pageNo=1`;

    if (isDev) {
        // Local Development: Vite Proxy 사용 (/gov-api -> https://api.socialservice.or.kr:444)
        // 주의: vite.config.ts 수정 후 서버 재시작 필수
        apiUrl = `/gov-api/api/service/provider/providerList${queryParams}`;
        if (query) apiUrl += `&providerName=${encodeURIComponent(query)}`;
    } else {
        // Production (Vercel): Serverless Function 사용
        apiUrl = `/api/gov-proxy?query=${encodeURIComponent(query)}`;
    }

    console.log(`[Frontend] Fetching API (${isDev ? 'Local Proxy' : 'Vercel Function'}): ${apiUrl}`);
    
    // 5초 타임아웃
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
             // 프록시가 에러를 JSON으로 반환한 경우
             const errJson = await response.json();
             throw new Error(errJson.error || "Proxy returned JSON error");
        }
        xmlText = await response.text();
        statusMessage = '사회서비스 API 연동 성공';
    } else {
        // 404 등 HTTP 에러 처리
        if (response.status === 404 && isDev) {
            console.error("Local Proxy 404 Error: Vite 개발 서버를 재시작했는지 확인해주세요. (vite.config.ts 변경 적용 필요)");
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

  } catch (error: any) {
    console.warn("API Call Failed (Falling back to Mock):", error.message);
    statusMessage = `API 연결 불안정 (${error.message || 'TimeOut'})`;
  }

  // --- XML 파싱 로직 ---
  if (xmlText && !xmlText.includes('error') && xmlText.includes('<response>')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const items = xmlDoc.getElementsByTagName('item');
        
      if (items.length > 0) {
          const apiProviders: Provider[] = [];
          for (let i = 0; i < items.length; i++) {
              const item = items[i];
              
              const name = item.getElementsByTagName('providerName')[0]?.textContent || '이름 없음';
              const addr = item.getElementsByTagName('address')[0]?.textContent || item.getElementsByTagName('loadAddress')[0]?.textContent || '주소 정보 없음';
              const phone = item.getElementsByTagName('telNumber')[0]?.textContent || '';
              const serviceName = item.getElementsByTagName('serviceName')[0]?.textContent || '사회서비스 제공기관';

              // 등급 정보 임의 배정 (실제 API는 qualityList 별도 호출 필요)
              let grade = QualityGrade.Unrated;
              if (Math.random() > 0.6) grade = QualityGrade.A;
              else if (Math.random() > 0.6) grade = QualityGrade.B;

              // Mock 데이터 생성
              const userCount = Math.floor(Math.random() * 1500) + 50; 
              const yearsActive = Math.floor(Math.random() * 10) + 1;

              apiProviders.push({
                  id: `gov_${i}_${Date.now()}`, 
                  name: name,
                  location: addr,
                  description: serviceName,
                  grade: grade,
                  yearsActive: yearsActive,
                  userCount: userCount,
                  isVerified: false, 
                  isAd: false,
                  reviews: [], 
                  imageUrl: `https://picsum.photos/500/300?random=${i + 600}`, 
                  priceStart: 0,
                  phoneNumber: phone
              });
          }
          if (apiProviders.length > 0) return { data: apiProviders, status: statusMessage, isMock: false };
      }
    } catch (e) { 
        console.error("XML Parse Error", e); 
    }
  }

  // ============================================================================
  // [Fallback] Mock Data Generator
  // ============================================================================
  
  const fallbackData = MOCK_PROVIDERS.filter(p => p.name.includes(query) || p.location.includes(query));
  
  if (fallbackData.length < 3 && query.length > 1) {
      const demoProviders: Provider[] = [];
      const city = query.length >= 2 ? query.substring(0, 2) : '서울';
      
      for(let i = 1; i <= 3; i++) {
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
            imageUrl: `https://picsum.photos/500/300?random=${2000+i}`,
            priceStart: 1300000,
            phoneNumber: '010-1234-5678'
         });
      }
      return { 
        data: [...fallbackData, ...demoProviders], 
        status: `검색 결과 (데모 모드) - API 응답 없음`, 
        isMock: true 
      };
  }

  return { 
    data: fallbackData, 
    status: fallbackData.length > 0 ? '체험 데이터 표시' : '검색 결과 없음', 
    isMock: true 
  };
};

export const loginWithSocial = async (provider: 'kakao' | 'google' | 'apple') => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    token: 'mock_jwt_token',
    user: { name: '새내기맘', email: `user@${provider}.com` }
  };
};
