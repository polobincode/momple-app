import { MOCK_PROVIDERS } from '../constants';
import { Provider, QualityGrade } from '../types';

// ============================================================================
// [API 설정]
// 1순위: 자체 백엔드 (/api/gov-proxy) - 배포 환경에서 작동 (CORS/HTTPS 문제 해결)
// 2순위: 무료 프록시 (corsproxy.io) - 백엔드 실패 시 시도
// 3순위: Mock 데이터 - 모든 연결 실패 시 체험 모드 제공
// ============================================================================

const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';

// ============================================================================
// 1. 사업자등록정보 진위확인 (Mock 유지)
// ============================================================================
export const verifyBusinessNumber = async (businessNo: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  const cleanNum = businessNo.replace(/-/g, '');
  return cleanNum.length === 10;
};

// ============================================================================
// 2. 산후도우미 업체 검색
// ============================================================================
export const searchProvidersFromGov = async (query: string): Promise<{ data: Provider[], status: string, isMock: boolean }> => {
  let xmlText: string | null = null;
  let statusMessage = '';

  // --- 1단계: 자체 백엔드(Serverless Function) 시도 ---
  try {
    const backendUrl = `/api/gov-proxy?query=${encodeURIComponent(query || '')}`;
    console.log(`[API] Trying Backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl);
    
    // 로컬 개발(npm run dev)에서는 /api 경로가 없어 404가 뜰 수 있음 -> catch로 이동
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         // 에러 응답인 경우
         throw new Error("Backend returned JSON error");
      }
      xmlText = await response.text();
      statusMessage = '공공데이터 연동 성공 (Backend)';
    } else {
      throw new Error(`Backend Status ${response.status}`);
    }
  } catch (backendError) {
    console.warn(`[API] Backend failed, trying fallback proxy...`, backendError);
    
    // --- 2단계: 무료 프록시(corsproxy.io) 시도 (백업) ---
    try {
      let baseUrl = `http://api.socialservice.or.kr/openapi/service/rest/ProviderInfoService/getProviderList`;
      let queryParams = `?serviceKey=${GOV_API_KEY}&numOfRows=100&pageNo=1`;
      if (query) queryParams += `&keyword=${encodeURIComponent(query)}`;
      
      // corsproxy.io 사용
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(baseUrl + queryParams)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

      const response = await fetch(proxyUrl, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(timeoutId);

      if (response.ok) {
        xmlText = await response.text();
        statusMessage = '공공데이터 연동 성공 (Proxy)';
      } else {
        throw new Error(`Proxy Status ${response.status}`);
      }
    } catch (proxyError) {
      console.warn(`[API] All network requests failed.`, proxyError);
    }
  }

  // --- 3단계: 데이터 파싱 또는 Mock 전환 ---
  if (xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const errMsg = xmlDoc.getElementsByTagName('errMsg')[0]?.textContent;
      const returnAuthMsg = xmlDoc.getElementsByTagName('returnAuthMsg')[0]?.textContent;
      
      if (!errMsg && !returnAuthMsg) {
        const items = xmlDoc.getElementsByTagName('item');
        
        if (items.length > 0) {
          const apiProviders: Provider[] = [];
          for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const name = item.getElementsByTagName('facilNm')[0]?.textContent || '이름 없는 업체';
              const addr = item.getElementsByTagName('addr')[0]?.textContent || '주소 미제공';
              const tel = item.getElementsByTagName('telNo')[0]?.textContent || '';
              const gradeStr = item.getElementsByTagName('evalInfo')[0]?.textContent || ''; 
              const regDate = item.getElementsByTagName('regDt')[0]?.textContent || '';

              // 등급 매핑
              let grade = QualityGrade.Unrated;
              if (gradeStr.includes('A') || gradeStr.includes('최우수')) grade = QualityGrade.A;
              else if (gradeStr.includes('B') || gradeStr.includes('우수')) grade = QualityGrade.B;
              else if (gradeStr.includes('C') || gradeStr.includes('보통')) grade = QualityGrade.C;

              // 업력 계산
              let yearsActive = 1;
              if (regDate && regDate.length >= 4) {
                  const year = parseInt(regDate.substring(0, 4));
                  yearsActive = new Date().getFullYear() - year;
                  if (yearsActive < 0) yearsActive = 1; 
              }

              apiProviders.push({
                  id: `gov_${i}_${Date.now()}`, 
                  name: name,
                  location: addr,
                  description: `정부 등록 공식 인증 업체입니다. (문의: ${tel})`,
                  grade: grade,
                  yearsActive: yearsActive,
                  isVerified: true, 
                  isAd: false,
                  reviews: [], 
                  imageUrl: `https://picsum.photos/500/300?random=${400 + i}`, 
                  priceStart: 0, 
                  phoneNumber: tel
              });
          }
          return { data: apiProviders, status: statusMessage, isMock: false };
        }
      }
    } catch (parseError) {
      console.error("XML Parsing Error:", parseError);
    }
  }

  // --- 최후의 수단: Mock 데이터 반환 ---
  console.log("[API] Switching to Demo Mode (Mock Data)");
  const filteredMock = query 
    ? MOCK_PROVIDERS.filter(p => p.name.includes(query) || p.location.includes(query))
    : MOCK_PROVIDERS;

  // 검색 결과가 아예 없는 경우
  if (filteredMock.length === 0 && query && xmlText) {
      return { data: [], status: '검색 결과 없음', isMock: false };
  }

  return { 
    data: filteredMock, 
    status: '체험 모드 (테스트 데이터)', 
    isMock: true 
  };
};

export const loginWithSocial = async (provider: 'kakao' | 'google' | 'apple') => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    token: 'mock_jwt_token',
    user: { name: '새내기맘', email: `user@${provider}.com` }
  };
};