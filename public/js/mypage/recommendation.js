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
 * certId를 실제 자격증 정보로 매핑 (더미 데이터의 certificates 사용)
 * @param {Array} recommendations - 추천 certId 배열
 * @param {Array} certificates - 더미 데이터의 자격증 목록
 * @returns {Array} - 자격증 정보 배열
 */
function mapCertIdsToInfo(recommendations, certificates) {
  // certificates 배열을 certId 기준으로 맵으로 변환
  const certMap = {};
  certificates.forEach(cert => {
    certMap[cert.certId] = cert;
  });
  
  return recommendations.map(rec => {
    const certInfo = certMap[rec.certId];
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
  
  // 4. certId를 실제 자격증 정보로 매핑 (더미 데이터의 certificates 사용)
  const recommendedCerts = mapCertIdsToInfo(topRecommendations, dummyData.certificates);
  
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
    console.log('더미 데이터 로드 시작...');
    const response = await fetch('../Dummy_data/dummy_data.json');
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! status: ${response.status}`);
    }
    
    const dummyData = await response.json();
    console.log('더미 데이터 로드 성공:', dummyData);
    console.log('certificates 존재 여부:', !!dummyData.certificates);
    console.log('certificates 길이:', dummyData.certificates?.length);
    
    if (!dummyData.certificates) {
      console.error('certificates 배열이 없습니다!');
      console.log('전체 데이터 구조:', Object.keys(dummyData));
      return [];
    }
    
    const recommendations = generateRecommendations(dummyData, currentUserId);
    
    // DATA.certsReco 업데이트
    if (window.DATA) {
      window.DATA.certsReco = recommendations;
    }
    
    return recommendations;
  } catch (error) {
    console.error('더미 데이터 로드 실패:', error);
    console.error('에러 상세:', error.message);
    console.error('스택:', error.stack);
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
