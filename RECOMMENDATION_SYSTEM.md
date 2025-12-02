# 추천 시스템 (Recommendation System)

## 개요
더미 데이터의 `search_clicks`를 분석하여 자격증별 클릭 수를 계산하고, 현재 사용자가 북마크한 자격증을 제외한 상위 5개를 추천하는 시스템입니다.

## 동작 방식

### 1. 클릭 수 계산
- `dummy_data.json`의 `search_clicks` 배열을 순회하며 각 자격증 ID(`certId`)별 클릭 수를 집계합니다.
- 예: `PVT-2025-005`가 5번 클릭되었다면 `{ "PVT-2025-005": 5 }`로 저장됩니다.

### 2. 북마크 필터링
- 현재 사용자(`uid`)의 북마크된 자격증 목록을 `bookmarks` 배열에서 추출합니다.
- 클릭 수 집계에서 북마크된 자격증들을 제외합니다.

### 3. 상위 5개 선정
- 북마크를 제외한 자격증들을 클릭 수 기준으로 내림차순 정렬합니다.
- 상위 5개를 선택하여 추천 목록으로 제공합니다.

### 4. 자격증 정보 매핑
- 선정된 자격증 ID를 실제 자격증 정보(이름, 분야, 시험일 등)로 변환합니다.
- 매핑 테이블은 `recommendation.js`의 `certMapping` 객체에 정의되어 있습니다.

## 계산 공식

```
추천 점수 = 클릭 수
조건: 사용자가 북마크한 자격증은 제외
결과: 클릭 수 기준 내림차순 상위 5개
```

## 파일 구조

```
public/
├── js/
│   ├── recommendation.js          # 추천 시스템 핵심 로직
│   └── mypage/
│       └── mypage.js              # 마이페이지에서 추천 시스템 호출
├── Dummy_data/
│   └── dummy_data.json            # 더미 데이터 (클릭 및 북마크 정보)
└── mypage.html                    # 마이페이지 (추천 시스템 표시)
```

## 주요 함수

### `calculateCertClickCounts(searchClicks)`
- **입력**: `search_clicks` 배열
- **출력**: `{ certId: 클릭수 }` 형태의 객체
- **기능**: 자격증별 총 클릭 수 계산

### `getUserBookmarkedCertIds(bookmarks, uid)`
- **입력**: `bookmarks` 배열, 사용자 ID
- **출력**: 북마크된 `certId` Set
- **기능**: 특정 사용자가 북마크한 자격증 ID 추출

### `getTopRecommendations(clickCounts, bookmarkedIds, topN=5)`
- **입력**: 클릭 수 객체, 북마크 Set, 추출 개수
- **출력**: 추천 자격증 배열
- **기능**: 북마크 제외 후 상위 N개 선정

### `generateRecommendations(dummyData, currentUserId)`
- **입력**: 더미 데이터, 사용자 ID
- **출력**: 추천 자격증 정보 배열
- **기능**: 전체 추천 프로세스 실행

### `loadDummyDataAndGenerateRecommendations(currentUserId)`
- **입력**: 사용자 ID (기본값: 'user001')
- **출력**: Promise<추천 자격증 배열>
- **기능**: 더미 데이터 로드 및 추천 생성

## 사용 방법

### 마이페이지에서 자동 로드
마이페이지(`mypage.html`)에 접속하면 자동으로 추천 시스템이 실행됩니다.

### 개발자 콘솔에서 테스트

#### 1. 다른 사용자로 전환하기
```javascript
// user001 ~ user010 중 선택
switchUser('user002');
```

페이지가 새로고침되며 해당 사용자의 추천 결과를 확인할 수 있습니다.

#### 2. 현재 사용자 확인
```javascript
getCurrentUserId(); // 'user001'
```

#### 3. 추천 결과 수동 생성
```javascript
// 특정 사용자의 추천 결과 확인
const recommendations = await loadDummyDataAndGenerateRecommendations('user003');
console.log(recommendations);
```

## 더미 데이터 사용자

| 사용자 ID | 북마크 개수 | 특징 |
|----------|-----------|------|
| user001  | 2개       | PVT-2025-001, PVT-2025-006 |
| user002  | 3개       | JMCD_1006, JMCD_1002, 다수 |
| user003  | 2개       | JMCD_1009, PVT-2025-007 |
| user004  | 2개       | PVT-2025-004, PVT-2025-005 |
| user005  | 1개       | PVT-2025-010 |
| user006  | 2개       | JMCD_1001, PVT-2025-000 |
| user007  | 1개       | JMCD_1007 |
| user008  | 5개       | 가장 많은 북마크 |
| user009  | 3개       | PVT-2025-009, JMCD_1003, JMCD_1008 |
| user010  | 2개       | JMCD_1004, JMCD_1002 |

## 추천 결과 예시

### user001의 추천 결과
```javascript
[
  { name: "GTQ 그래픽기술자격", field: "디자인", next: "2026-01-12", rate: 4.1, clickCount: 6 },
  { name: "물류관리사", field: "유통/물류", next: "2026-01-18", rate: 4.2, clickCount: 5 },
  { name: "워드프로세서", field: "사무", next: "2025-12-15", rate: 4.0, clickCount: 5 },
  // ... 상위 5개
]
```

## 확장 계획

### 단기 (API 연동 전)
1. ✅ 클릭 수 기반 추천
2. ⬜ 가중치 추가 (최근 클릭에 더 높은 점수)
3. ⬜ 컨텍스트별 가중치 (search > trending > home_reco)

### 중기 (API 연동 후)
1. ⬜ 실시간 클릭 데이터 수집
2. ⬜ 사용자 행동 패턴 분석
3. ⬜ 협업 필터링 (다른 유사 사용자의 선호도 반영)

### 장기
1. ⬜ 머신러닝 기반 추천
2. ⬜ A/B 테스트를 통한 추천 알고리즘 개선
3. ⬜ 개인화된 추천 (학습 진행도, 관심사 등 고려)

## 문제 해결

### 추천 결과가 나오지 않는 경우
1. 브라우저 콘솔에서 에러 확인
2. `dummy_data.json` 파일 경로 확인 (`/Dummy_data/dummy_data.json`)
3. 네트워크 탭에서 파일 로드 여부 확인

### 북마크 필터링이 작동하지 않는 경우
1. 현재 사용자 ID 확인: `getCurrentUserId()`
2. 해당 사용자의 북마크 확인: 더미 데이터에서 `uid`로 필터링
3. 콘솔 로그 확인: 추천 시스템 로그 출력

## 관련 이슈
- 북마크 시스템과의 연동은 추후 Firebase 연동 시 개선 예정
- 현재는 더미 데이터 기반으로만 동작

## 라이센스
CertHub 프로젝트 라이센스를 따릅니다.
