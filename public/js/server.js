/*
    // server.js  — 공공데이터 API 프록시 서버
    --> 브라우저에서 직접 호출 불가능한 공공데이터 API를 Node 서버가 대신 호출해 XML을 그대로 프론트에 다시 전달
*/

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // node-fetch@2 설치 필수!
const serviceKey = '6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd';

const app = express();
const PORT = 3000;

// CORS 허용 (브라우저에서 호출할 거라서)
app.use(cors());

// =============================================== 자격증 목록 ===============================================
app.get('/api/cert', async (req, res) => {
  const certName = req.query.name || '';

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

// =============================================== 자격 정보 상세 조회 (종목코드 기반) ===============================================
// 상세 조회 API
app.get('/api/cert/detail', async (req, res) => {
  const jmCd = req.query.jmcd;
  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const baseUrl = 'http://openapi.q-net.or.kr/api/service/rest/InquiryInformationTradeNTQSVC/getList';

  const query =
    `?serviceKey=${serviceKey}` +
    `&jmCd=${encodeURIComponent(jmCd)}`;

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xmlText);
  } catch (error) {
    console.error("상세조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});


// =============================================== 시험 일정 API ===============================================
app.get('/api/schedule', async (req, res) => {
  const jmCd = req.query.jmcd;   // 종목코드
  const year = req.query.implYy;   // 연도 (옵션)

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

    // ⭐ year가 비어있다면 올해 기준 (예: new Date().getFullYear())
  if (!year || year.trim() === "") {
    year = String(new Date().getFullYear());
  }

  const baseUrl =
    'https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList';

  let query =
    `?serviceKey=${encodeURIComponent(serviceKey)}` +
    `&dataFormat=xml` +                     // ✔ 반드시 포함
    `&jmCd=${encodeURIComponent(jmCd)}` +   // ✔ 필수
    `&implYy=${encodeURIComponent(year)}` + // ✔ 필수
    `&pageNo=1&numOfRows=10`; 

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xmlText);
  } catch (error) {
    console.error("시험 일정 조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// =============================================== 관련 자격 API ===============================================
app.get('/api/attendqual', async (req, res) => {
  const jmCd = req.query.jmcd;   // 종목코드

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const baseUrl = 'http://openapi.q-net.or.kr/api/service/rest/InquiryAttenQualSVC/getList';

  // 전체 자격증 목록을 가져온 후 클라이언트에서 attenJmCd로 필터링
  const query = `?serviceKey=${serviceKey}&jmCd=${encodeURIComponent(jmCd)}&pageNo=1&numOfRows=1000`;

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xmlText);
  } catch (error) {
    console.error("관련 자격증 조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// =============================================== 응시자격별 원서접수 및 합격 현황 API ===============================================
app.get('/api/exam/stats', async (req, res) => {
  const grdCd = req.query.grdCd || '10';     // 등급코드
  const baseYY = req.query.baseYY || '2023'; // 연도 기본값

  const baseUrl = 'http://openapi.q-net.or.kr/api/service/rest/InquiryEmqualPassSVC/getList';

  const url =
    `${baseUrl}?serviceKey=${encodeURIComponent(serviceKey)}` +
    `&dataFormat=xml` +
    `&grdCd=${encodeURIComponent(grdCd)}` +
    `&baseYY=${encodeURIComponent(baseYY)}` +
    `&pageNo=1&numOfRows=2000`;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("응시현황 API 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});
