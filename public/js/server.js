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

app.use(cors());

// =========================================
// 자격증 목록 API
// =========================================
app.get('/api/cert', async (req, res) => {
    const certName = req.query.name || '';

    const baseUrl = 'http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList';
    const query =
        `?serviceKey=${serviceKey}` +
        `&jmNm=${encodeURIComponent(certName)}` +
        `&pageNo=1&numOfRows=100`;

    try {
        const response = await fetch(baseUrl + query);
        const xmlText = await response.text();

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.send(xmlText);
    } catch (error) {
        res.status(500).send("서버 오류: " + error.message);
    }
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


// =========================================
//  시험 일정 API (등급별 URL 자동 변경 버전)
// =========================================
app.get('/api/schedule', async (req, res) => {
    const jmCd = req.query.jmcd;
    const grade = req.query.grade;
    let year = req.query.implYy || String(new Date().getFullYear());

    if (!jmCd || !grade) {
        return res.status(400).send("jmcd와 grade가 필요합니다.");
    }

    let apiName = "";
    let useJmCd = true;  // 기본값: 종목코드 사용

    if (grade.includes("기술사")) apiName = "getPEList";   // 기술사는 종목별 일정 존재
    else if (grade.includes("기능장")) apiName = "getMCList"; // 기능장은 종목별 일정 존재
    else if (grade.includes("기사")) {
        apiName = "getEList";
        useJmCd = false;   // 🔥 기사/산업기사는 종목별 일정 없음 → jmCd 제거
    }
    else if (grade.includes("기능사")) {
        apiName = "getCList";
        useJmCd = false;   // 🔥 기능사도 종목별 일정 없음 → jmCd 제거
    }

    const baseUrl = `http://openapi.q-net.or.kr/api/service/rest/InquiryTestInformationNTQSVC/${apiName}`;

    let query =
        `?serviceKey=${serviceKey}` +
        `&implYy=${encodeURIComponent(year)}` +
        `&pageNo=1&numOfRows=500`;

    if (useJmCd) {
        query += `&jmCd=${encodeURIComponent(jmCd)}`;
    }

    try {
        const response = await fetch(baseUrl + query);
        const xmlText = await response.text();
        res.set("Content-Type", "application/xml; charset=utf-8");
        res.send(xmlText);
    } catch (error) {
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
