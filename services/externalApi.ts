
import { MOCK_PROVIDERS } from '../constants';
import { Provider, QualityGrade } from '../types';

// ============================================================================
// [공공데이터 설정]
// 인증키가 올바르지 않거나, 서버가 응답하지 않을 경우 자동으로 Mock 데이터로 전환됩니다.
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
// 2. 산후도우미 업체 검색 (실제 API + Proxy + Mock Fallback)
// ============================================================================
export const searchProvidersFromGov = async (query: string): Promise<{ data: Provider[], status: string, isMock: boolean }> => {
  try {
      // 1. URL 구성
      let targetUrl = `http://api.socialservice.or.kr/openapi/service/rest/ProviderInfoService/getProviderList?serviceKey=${GOV_API_KEY}&numOfRows=100&pageNo=1`;
      if (query) targetUrl += `&keyword=${encodeURIComponent(query)}`;

      // 2. Proxy 사용 (CORS/Mixed Content 우회)
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      console.log(`[Real API] Requesting: ${proxyUrl}`);

      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error(`Status ${response.status}`);

      const textData = await response.text();
      // console.log("[Real API] Response:", textData.substring(0, 100) + "...");

      // 3. XML 파싱
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textData, "text/xml");
      
      const errMsg = xmlDoc.getElementsByTagName('errMsg')[0]?.textContent;
      const returnAuthMsg = xmlDoc.getElementsByTagName('returnAuthMsg')[0]?.textContent;
      
      // API 에러 감지 시
      if (errMsg || returnAuthMsg) {
        throw new Error(errMsg || returnAuthMsg);
      }

      const items = xmlDoc.getElementsByTagName('item');
      
      // 4. 결과가 없으면 Mock 데이터 반환 (사용자 경험 우선)
      if (items.length === 0) {
          console.warn("[Real API] 0 items found. Switching to Mock Data.");
          // 검색어 필터링하여 Mock 반환
          const filteredMock = query 
            ? MOCK_PROVIDERS.filter(p => p.name.includes(query) || p.location.includes(query))
            : MOCK_PROVIDERS;
            
          return { 
            data: filteredMock, 
            status: 'API 결과 없음 (테스트 데이터 표시)', 
            isMock: true 
          };
      }

      // 5. 실제 데이터 매핑
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

      return { data: apiProviders, status: '공공데이터 연동 성공', isMock: false };

  } catch (error: any) {
      console.warn(`[Real API] Failed (${error.message}). Using Mock Data.`);
      
      const filteredMock = query 
        ? MOCK_PROVIDERS.filter(p => p.name.includes(query) || p.location.includes(query))
        : MOCK_PROVIDERS;

      return { 
        data: filteredMock, 
        status: `연동 실패: ${error.message} (테스트 모드)`, 
        isMock: true 
      };
  }
};

export const loginWithSocial = async (provider: 'kakao' | 'google' | 'apple') => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    token: 'mock_jwt_token',
    user: { name: '새내기맘', email: `user@${provider}.com` }
  };
};
