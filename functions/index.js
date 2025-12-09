const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// 🔥 공통 서비스키 (절대 인코딩 필수!!)
const SERVICE_KEY = "6392230c571116074d2e799a1309a9e8ac656fc32deebd7be9f12b12328518fd";


// ===============================================
// 📘 자격증 목록 API 
// ===============================================
app.get("/api/cert", async (req, res) => {
  const search = (req.query.name || "").trim();

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList";

  let query =
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&pageNo=1&numOfRows=999`;

  if (search !== "") {
    query += `&jmNm=${encodeURIComponent(search)}`;
  }

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (e) {
    console.error("cert API 오류:", e);
    res.status(500).send("서버 오류: " + e.message);
  }
});


// ===============================================
// 📘 자격 상세 조회 API
// ===============================================
app.get("/api/cert/detail", async (req, res) => {
  const jmCd = req.query.jmcd;
  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryInformationTradeNTQSVC/getList";

  let query =
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&jmCd=${encodeURIComponent(jmCd)}`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (e) {
    console.error("상세 조회 오류:", e);
    res.status(500).send("서버 오류: " + e.message);
  }
});


// ===============================================
// 📘 시험 일정 API (등급 grade로 분기)
// ===============================================
app.get("/api/schedule", async (req, res) => {
  const jmCd = req.query.jmcd;
  const grade = (req.query.grade || "").trim();
  let year = (req.query.implYy || "").trim();

  if (!jmCd) return res.status(400).send("jmcd parameter is required.");
  if (year === "") year = String(new Date().getFullYear());

  let apiPath = "";

  if (grade.includes("기술사")) apiPath = "getPEList";
  else if (grade.includes("기능장")) apiPath = "getMCList";
  else if (grade.includes("기능사")) apiPath = "getCList";
  else if (grade.includes("산업기사")) apiPath = "getEList";
  else if (grade.includes("기사")) apiPath = "getEList";
  else apiPath = "getEList"; // fallback

  const baseUrl =
    `http://openapi.q-net.or.kr/api/service/rest/InquiryTestInformationNTQSVC/${apiPath}`;

  const query =
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&jmCd=${encodeURIComponent(jmCd)}` +
    `&implYy=${encodeURIComponent(year)}` +
    `&pageNo=1&numOfRows=100`;

  const url = baseUrl + query;
  console.log("📡 시험일정 호출 URL:", url);

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (e) {
    console.error("시험 일정 조회 오류:", e);
    res.status(500).send("서버 오류: " + e.message);
  }
});


// ===============================================
// 📘 통계 API
// ===============================================
app.get("/api/exam/stats", async (req, res) => {
  const grdCd = req.query.grdCd || "10";
  const baseYY = req.query.baseYY || "2023";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryEmqualPassSVC/getList";

  const query =
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&dataFormat=xml` +
    `&grdCd=${encodeURIComponent(grdCd)}` +
    `&baseYY=${encodeURIComponent(baseYY)}` +
    `&pageNo=1&numOfRows=2000`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (e) {
    console.error("통계 API 오류:", e);
    res.status(500).send("서버 오류: " + e.message);
  }
});


// ===============================================
// 📘 관련 자격 조회 API
// ===============================================
app.get("/api/attendqual", async (req, res) => {
  const jmCd = req.query.jmcd;
  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryAttenQualSVC/getList";

  const query =
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&jmCd=${encodeURIComponent(jmCd)}` +
    `&pageNo=1&numOfRows=1000`;

  try {
    const response = await fetch(baseUrl + query);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (e) {
    console.error("관련자격 조회 오류:", e);
    res.status(500).send("서버 오류: " + e.message);
  }
});


// ===============================================
// Firebase Functions Export
// ===============================================
exports.api = functions.https.onRequest(app);
