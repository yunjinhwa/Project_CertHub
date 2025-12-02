const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// ===============================================
// 자격증 목록 API
// ===============================================
app.get("/api/cert", async (req, res) => {
  const certName = req.query.name || "";
  const serviceKey = "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList";

  const query =
    `?serviceKey=${serviceKey}` +
    `&jmNm=${encodeURIComponent(certName)}` +
    `&pageNo=1&numOfRows=100`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// 자격 상세 조회 API
// ===============================================
app.get("/api/cert/detail", async (req, res) => {
  const jmCd = req.query.jmcd;
  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryInformationTradeNTQSVC/getList";

  const query = `?serviceKey=${serviceKey}&jmCd=${encodeURIComponent(jmCd)}`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// 시험 일정 API
// ===============================================
app.get("/api/schedule", async (req, res) => {
  const jmCd = req.query.jmcd;
  let year = req.query.year || req.query.implYy;

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");
  if (!year || year.trim() === "") year = String(new Date().getFullYear());

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList";

  const query =
    `?serviceKey=${encodeURIComponent(serviceKey)}` +
    `&dataFormat=xml` +
    `&jmCd=${encodeURIComponent(jmCd)}` +
    `&implYy=${encodeURIComponent(year)}` +
    `&pageNo=1&numOfRows=20`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    res.status(500).send("서버 오류: " + error.message);
  }
});
// ===============================================
// 응시자격별 원서접수 및 합격 현황 조회 API (TOP 응시자수 데이터)
// ===============================================
app.get("/api/exam/stats", async (req, res) => {
  const grdCd = req.query.grdCd || "10";     // 기능사 기본값
  const baseYY = req.query.baseYY || "2023"; // 연도 기본값

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryEmqualPassSVC/getList";

  const query =
    `?serviceKey=${encodeURIComponent(serviceKey)}` +
    `&dataFormat=xml` +
    `&grdCd=${grdCd}` +
    `&baseYY=${baseYY}` +
    `&pageNo=1&numOfRows=2000`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("시험 현황 호출 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// 관련 자격증 조회 API 추가
// ===============================================
app.get("/api/attendqual", async (req, res) => {
  const jmCd = req.query.jmcd;

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryAttenQualSVC/getList";

  const query =
    `?serviceKey=${serviceKey}&jmCd=${encodeURIComponent(jmCd)}&pageNo=1&numOfRows=1000`; // 전체 자격증 목록 가져오기 (클라이언트에서 attenJmCd로 필터링)

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("관련 자격증 호출 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// Firebase Functions로 Export
// ===============================================

exports.api = functions.https.onRequest(app);
