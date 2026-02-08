
// Vercel Serverless Function (Node.js)

export default async function handler(request, response) {
  // 문서에 명시된 API 키
  const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';
  
  // [수정] 명세서 기준 정확한 URL (providerList)
  const BASE_URL = 'https://api.socialservice.or.kr:444/api/service/provider/providerList';

  const { query } = request.query;

  // [수정] 파라미터 구성
  // pageNo=1, numOfRows=100
  // serviceType을 지정하지 않아야 전체 서비스(산후도우미 포함)에서 이름으로 검색될 가능성이 높음
  // 문서 예시: &providerName=제이
  let targetUrl = `${BASE_URL}?pageNo=1&numOfRows=100&ServiceKey=${GOV_API_KEY}`;
  
  if (query) {
    // [수정] 업체명 검색 파라미터: providerName
    targetUrl += `&providerName=${encodeURIComponent(query)}`;
  }

  try {
    console.log(`[Proxy] Fetching: ${targetUrl}`);

    // Node.js fetch (포트 444 접속)
    // SSL 에러 방지를 위해 rejectUnauthorized 옵션이 필요할 수 있으나,
    // Vercel 환경에서는 기본 fetch 사용. 에러 발생 시 catch 블록에서 처리.
    const apiRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml, */*' 
      }
    });
    
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[Proxy] Upstream Error: ${apiRes.status} ${errText}`);
      throw new Error(`SocialService API Error (${apiRes.status})`);
    }

    const xmlData = await apiRes.text();

    // 응답 헤더 설정 (XML 명시)
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // 캐시 설정 (1시간)
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    response.status(200).send(xmlData);

  } catch (error) {
    console.error('[Backend Error]', error);
    // 에러 발생 시 JSON으로 에러 반환 (클라이언트가 XML 파싱 실패로 인지하고 Mock으로 전환하도록 유도)
    response.status(500).json({ 
      error: 'Failed to fetch data from Social Service API',
      details: error.message,
      target: targetUrl 
    });
  }
}
