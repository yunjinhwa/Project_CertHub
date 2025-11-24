// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // node-fetch@2 설치 필수!

const app = express();
const PORT = 3000;

// CORS 허용 (브라우저에서 호출할 거라서)
app.use(cors());

// 자격증 조회 프록시 API
app.get('/api/cert', async (req, res) => {
  const certName = req.query.name || '';
  const serviceKey = 'd969c53a49d2b0f858f6a0298c6c52f20a398a12a952185694f67b019f0aa72e';

  // Q-Net 공공데이터 API 원본 URL
  const baseUrl = 'http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList';

  // 검색 파라미터 (jmNm은 "종목명" 검색으로 가정)
  const query =
    `?serviceKey=${serviceKey}` +
    `&jmNm=${encodeURIComponent(certName)}` +
    `&pageNo=1&numOfRows=100`;

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    // 디버깅용 (필요하면 주석 해제)
    // console.log(xmlText);

    // 브라우저에 XML 그대로 전달
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xmlText);
  } catch (error) {
    console.error('Q-Net 호출 중 오류:', error);
    res.status(500).send('서버 오류: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
