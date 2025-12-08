const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// ===============================================
// 📘 자격증 목록 API  (검색 + 전체목록 모두 지원)
// ===============================================
app.get("/api/cert", async (req, res) => {
  const certName = req.query.name?.trim() || "";
  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList";

  // 🔥 핵심: 검색어가 있을 때만 jmNm 추가
  let query = `?serviceKey=${serviceKey}&pageNo=1&numOfRows=999`;

  // ✔ 검색어가 있을 때만 jmNm 추가
  if (certName && certName.trim() !== "") {
    query += `&jmNm=${encodeURIComponent(certName)}`;
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

// ===============================================
// 📘 자격 상세 조회 API
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
    console.error("상세 조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// 📘 시험 일정 API (getPEList)
// ===============================================
app.get("/api/schedule", async (req, res) => {
  const jmCd = req.query.jmcd || null;
  let year = req.query.implYy;

  if (!year || year.trim() === "") {
    year = String(new Date().getFullYear());
  }

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryTestInformationNTQSVC/getPEList";

  let query = `?serviceKey=${encodeURIComponent(serviceKey)}`;

  // ⭐ 특정 종목 일정 조회
  if (jmCd) {
    query += `&jmCd=${encodeURIComponent(jmCd)}`;
    query += `&implYy=${encodeURIComponent(year)}`;
  }

  // ⭐ 전체 일정 조회
  query += "&pageNo=1&numOfRows=200";

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("시험 일정 조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// ===============================================
// 📘 응시자격별 접수/합격 통계 API
// ===============================================
app.get("/api/exam/stats", async (req, res) => {
  const grdCd = req.query.grdCd || "10";
  const baseYY = req.query.baseYY || "2023";

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
// 📘 관련 자격증 조회 API
// ===============================================
app.get("/api/attendqual", async (req, res) => {
  const jmCd = req.query.jmcd;

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const serviceKey =
    "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryAttenQualSVC/getList";

  const query =
    `?serviceKey=${serviceKey}&jmCd=${encodeURIComponent(jmCd)}&pageNo=1&numOfRows=1000`;

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
