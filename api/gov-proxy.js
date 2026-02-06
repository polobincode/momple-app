// Vercel Serverless Function (Node.js)
// 프론트엔드(HTTPS)와 공공데이터(HTTP) 사이의 다리 역할을 수행합니다.

export default async function handler(request, response) {
  // 1. 공공데이터 API 키 및 엔드포인트 설정
  const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';
  const BASE_URL = 'http://api.socialservice.or.kr/openapi/service/rest/ProviderInfoService/getProviderList';

  // 2. 클라이언트(프론트엔드)에서 보낸 검색어 파싱
  const { query } = request.query;

  // 3. 실제 공공데이터 API URL 조립
  let targetUrl = `${BASE_URL}?serviceKey=${GOV_API_KEY}&numOfRows=100&pageNo=1`;
  if (query) {
    targetUrl += `&keyword=${encodeURIComponent(query)}`;
  }

  try {
    console.log(`[Backend] Fetching: ${targetUrl}`);
    
    // 4. 서버에서 공공데이터(HTTP) 호출 (서버 간 통신이므로 CORS/Mixed Content 제약 없음)
    const apiRes = await fetch(targetUrl);
    
    if (!apiRes.ok) {
      throw new Error(`Government API responded with status ${apiRes.status}`);
    }

    // 5. XML 데이터 받기
    const xmlData = await apiRes.text();

    // 6. 프론트엔드로 결과 반환
    response.status(200).send(xmlData);

  } catch (error) {
    console.error('[Backend Error]', error);
    response.status(500).json({ 
      error: 'Failed to fetch data from government API',
      details: error.message 
    });
  }
}