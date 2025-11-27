// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // node-fetch@2

const app = express();
app.use(cors());

// =============================================== 자격증 목록 ===============================================
app.get("/api/cert", async (req, res) => {
  const certName = req.query.name || "";
  const serviceKey =
    "d969c53a49d2b0f858f6a0298c6c52f20a398a12a952185694f67b019f0aa72e";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList";

  const query =
    `?serviceKey=${serviceKey}` +
    `&jmNm=${encodeURIComponent(certName)}` +
    `&pageNo=1&numOfRows=100`;

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("Q-Net 호출 중 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// =============================================== 자격 상세 조회 ===============================================
app.get("/api/cert/detail", async (req, res) => {
  const jmCd = req.query.jmcd;
  if (!jmCd) return res.status(400).send("jmcd parameter is required.");

  const serviceKey =
    "d969c53a49d2b0f858f6a0298c6c52f20a398a12a952185694f67b019f0aa72e";

  const baseUrl =
    "http://openapi.q-net.or.kr/api/service/rest/InquiryInformationTradeNTQSVC/getList";

  const query =
    `?serviceKey=${serviceKey}` +
    `&jmCd=${encodeURIComponent(jmCd)}`;

  const url = baseUrl + query;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xmlText);
  } catch (error) {
    console.error("상세조회 오류:", error);
    res.status(500).send("서버 오류: " + error.message);
  }
});

// =============================================== Firebase Functions로 Express 배포 ===============================================
exports.api = functions.https.onRequest(app);
