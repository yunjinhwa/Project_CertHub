// 추천 시스템 - 더미 데이터 기반
// 클릭 수를 기반으로 자격증을 추천하고, 북마크된 항목은 제외

/**
 * 더미 데이터에서 자격증별 클릭 수를 계산
 * @param {Array} searchClicks - search_clicks 배열
 * @returns {Object} - certId별 클릭 수 맵
 */
function calculateCertClickCounts(searchClicks) {
  const clickCounts = {};
  
  searchClicks.forEach(click => {
    const certId = click.certId;
    if (clickCounts[certId]) {
      clickCounts[certId]++;
    } else {
      clickCounts[certId] = 1;
    }
  });
  
  return clickCounts;
}

/**
 * 더미 데이터에서 북마크된 자격증 ID 추출
 * @param {Array} bookmarks - bookmarks 배열
 * @param {string} uid - 사용자 ID
 * @returns {Set} - 북마크된 certId Set
 */
function getUserBookmarkedCertIds(bookmarks, uid) {
  const bookmarkedIds = new Set();
  
  bookmarks.forEach(bookmark => {
    if (bookmark.uid === uid) {
      bookmarkedIds.add(bookmark.certId);
    }
  });
  
  return bookmarkedIds;
}

/**
 * 클릭 수 기반 추천 목록 생성
 * @param {Object} clickCounts - certId별 클릭 수
 * @param {Set} bookmarkedIds - 제외할 북마크된 certId
 * @param {number} topN - 추출할 상위 개수
 * @returns {Array} - 추천 자격증 ID 배열
 */
function getTopRecommendations(clickCounts, bookmarkedIds, topN = 5) {
  // 북마크된 항목 제외
  const filteredCerts = Object.entries(clickCounts)
    .filter(([certId, count]) => !bookmarkedIds.has(certId));
  
  // 클릭 수 기준 내림차순 정렬
  filteredCerts.sort((a, b) => b[1] - a[1]);
  
  // 상위 N개 추출
  return filteredCerts.slice(0, topN).map(([certId, count]) => ({
    certId,
    clickCount: count
  }));
}

/**
 * certId를 실제 자격증 정보로 매핑
 * @param {Array} recommendations - 추천 certId 배열
 * @returns {Array} - 자격증 정보 배열
 */
function mapCertIdsToInfo(recommendations) {
  // certId 매핑 테이블 (실제로는 API나 데이터베이스에서 가져와야 함)
  const certMapping = {
    'PVT-2025-000': { name: 'SQLD', field: '데이터', next: '2025-12-14', rate: 4.6 },
    'PVT-2025-001': { name: '정보처리기사', field: 'IT/개발', next: '2025-11-23', rate: 4.7 },
    'PVT-2025-002': { name: '리눅스마스터 2급', field: 'IT/인프라', next: '2026-02-08', rate: 4.3 },
    'PVT-2025-003': { name: '정보보안기사', field: '보안', next: '2026-03-15', rate: 4.6 },
    'PVT-2025-004': { name: '네트워크관리사 2급', field: 'IT/인프라', next: '2026-02-22', rate: 4.1 },
    'PVT-2025-005': { name: 'AWS Solutions Architect', field: '클라우드', next: '2026-01-15', rate: 4.8 },
    'PVT-2025-006': { name: '빅데이터분석기사', field: '데이터/AI', next: '2026-01-10', rate: 4.8 },
    'PVT-2025-007': { name: '전산세무 1급', field: '회계/재무', next: '2026-02-20', rate: 4.5 },
    'PVT-2025-008': { name: 'ADsP', field: '데이터', next: '2026-02-01', rate: 4.2 },
    'PVT-2025-009': { name: 'TOEIC Speaking', field: '어학', next: '2025-12-10', rate: 4.4 },
    'PVT-2025-010': { name: '컴퓨터활용능력 1급', field: '사무/IT', next: '2025-12-21', rate: 4.3 },
    'JMCD_1000': { name: '사무자동화산업기사', field: '사무/IT', next: '2026-01-25', rate: 4.0 },
    'JMCD_1001': { name: '전산세무 2급', field: '회계/재무', next: '2025-12-07', rate: 4.4 },
    'JMCD_1002': { name: '물류관리사', field: '유통/물류', next: '2026-01-18', rate: 4.2 },
    'JMCD_1003': { name: '한국사능력검정시험', field: '교양', next: '2025-12-05', rate: 4.5 },
    'JMCD_1004': { name: 'GTQ 그래픽기술자격', field: '디자인', next: '2026-01-12', rate: 4.1 },
    'JMCD_1005': { name: '워드프로세서', field: '사무', next: '2025-12-15', rate: 4.0 },
    'JMCD_1006': { name: '전기기사', field: '전기/전자', next: '2026-03-08', rate: 4.3 },
    'JMCD_1007': { name: '건축기사', field: '건설/안전', next: '2026-03-22', rate: 4.4 },
    'JMCD_1008': { name: '소방설비기사', field: '건설/안전', next: '2026-04-05', rate: 4.2 },
    'JMCD_1009': { name: '위험물산업기사', field: '안전', next: '2026-03-15', rate: 4.1 },
    'JMCD_1010': { name: '산업안전기사', field: '안전', next: '2026-04-12', rate: 4.3 }
  };
  
  return recommendations.map(rec => {
    const certInfo = certMapping[rec.certId];
    if (certInfo) {
      return {
        ...certInfo,
        clickCount: rec.clickCount
      };
    }
    return null;
  }).filter(cert => cert !== null);
}

/**
 * 메인 추천 함수
 * @param {Object} dummyData - 더미 데이터 객체
 * @param {string} currentUserId - 현재 사용자 ID
 * @returns {Array} - 추천 자격증 목록
 */
window.generateRecommendations = function(dummyData, currentUserId = 'user001') {
  // 1. 클릭 수 계산
  const clickCounts = calculateCertClickCounts(dummyData.search_clicks);
  
  // 2. 사용자의 북마크 추출
  const bookmarkedIds = getUserBookmarkedCertIds(dummyData.bookmarks, currentUserId);
  
  // 3. 추천 목록 생성 (북마크 제외, 상위 5개)
  const topRecommendations = getTopRecommendations(clickCounts, bookmarkedIds, 5);
  
  // 4. certId를 실제 자격증 정보로 매핑
  const recommendedCerts = mapCertIdsToInfo(topRecommendations);
  
  console.log('=== 추천 시스템 로그 ===');
  console.log('총 클릭 데이터:', dummyData.search_clicks.length);
  console.log('사용자 북마크:', Array.from(bookmarkedIds));
  console.log('추천 결과:', recommendedCerts);
  
  return recommendedCerts;
};

/**
 * 더미 데이터 로드 및 추천 생성
 */
window.loadDummyDataAndGenerateRecommendations = async function(currentUserId = 'user001') {
  try {
    const response = await fetch('http://127.0.0.1:5000/Dummy_data/dummy_data.json');
    const dummyData = await response.json();
    
    const recommendations = generateRecommendations(dummyData, currentUserId);
    
    // DATA.certsReco 업데이트
    if (window.DATA) {
      window.DATA.certsReco = recommendations;
    }
    
    return recommendations;
  } catch (error) {
    console.error('더미 데이터 로드 실패:', error);
    return [];
  }
};

/**
 * 테스트용: 사용자 전환 함수
 * 개발자 콘솔에서 switchUser('user002') 와 같이 사용
 */
window.switchUser = function(userId) {
  localStorage.setItem('currentUserId', userId);
  console.log(`사용자 전환: ${userId}`);
  window.location.reload();
};

/**
 * 현재 사용자 ID 가져오기
 */
window.getCurrentUserId = function() {
  return localStorage.getItem('currentUserId') || 'user001';
};
