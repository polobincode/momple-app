
// Vercel Serverless Function (Node.js)
// 사회서비스 전자바우처 OpenAPI Proxy (제공기관 + 품질평가)

export default async function handler(request, response) {
  const GOV_API_KEY = '27c3fb03b6bbad323c5f91809853756c7f254e9066c559033fa4b4b9c6c35aae';
  const BASE_HOST = 'https://api.socialservice.or.kr:444';

  const { query, type } = request.query;

  let targetUrl = '';

  if (type === 'quality') {
    // 품질평가 API
    targetUrl = `${BASE_HOST}/api/service/quality/qualityList?pageNo=1&numOfRows=500&ServiceKey=${GOV_API_KEY}`;
  } else {
    // 제공기관 API (기본)
    targetUrl = `${BASE_HOST}/api/service/provider/providerList?pageNo=1&numOfRows=100&ServiceKey=${GOV_API_KEY}`;
    if (query) {
      targetUrl += `&providerName=${encodeURIComponent(query)}`;
    }
  }

  try {
    console.log(`[Proxy] Fetching: ${targetUrl}`);

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

    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    response.status(200).send(xmlData);

  } catch (error) {
    console.error('[Backend Error]', error);
    response.status(500).json({
      error: 'Failed to fetch data from Social Service API',
      details: error.message,
      target: targetUrl
    });
  }
}
