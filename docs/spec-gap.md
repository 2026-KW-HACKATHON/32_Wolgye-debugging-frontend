# 기준 문서 간 불일치 정리 (이슈 · 기획 · 와이어프레임 · API)

여러 에이전트가 같은 기준으로 작업하도록, 문서끼리 **다른 부분과 결정 상태**를 한곳에 모은 문서다. 기준일 2026-10-02.

- **✅ 확정**: 따르면 된다. 근거 문서를 적었다
- **🟡 제안**: 이 문서가 권하는 기준. 사람이 승인하면 ✅로 바꾼다
- **🔴 결정 필요**: 추측해서 구현하지 않는다. `TODO(logic)`을 남기고 보고한다

## 0. 기준 문서와 우선순위

| 순위 | 문서 | 위치 | 상태 |
|---|---|---|---|
| 1 | **Figma 와이어프레임** | Figma 파일 `월계디버깅` / 와이어프레임 페이지 | ✅ 화면 기준으로 확정 (2026-10-02, 담당자 결정). 화면 목록은 `docs/figma-wireframe.md` |
| 2 | Manyfast 「차곡차곡」 | Manyfast 프로젝트 `c736510d-4e1c-437e-88cf-78d20a06ef4e` | 요구사항(PRD)만 참고. **와이어프레임 v1은 Figma의 이전 버전**이다 |
| 3 | API 명세 | 백엔드 저장소 `docs/openapi-mock.yaml` + 백엔드 이슈 #4 결정 댓글 | 필드명·enum·에러 코드의 기준. 예시 값은 가짜 |
| 4 | Notion "API 명세 v0.2" | Notion | 임시안. 위와 다르면 위를 따른다 |
| — | FE GitHub 이슈 #4~#18, `docs/handoff-parking-admin.md`, `docs/manyfast-diff.md` | 이 저장소 | ⚠️ **Manyfast 기준으로 작성되어 있다.** 아래 표와 다르면 이 문서를 따른다 |

> 백엔드는 처음부터 "Figma > Manyfast > openapi > Notion" 순서를 따랐다 (백엔드 `CLAUDE.md`). 프론트 문서만 Manyfast 기준이어서 아래 차이가 생겼다.

## 1. 공통 값 — 인수인계 문서 4장과 다른 것

| 항목 | FE 현재 (handoff 4장 · 코드) | API 명세 (Figma 기준) | 판정 |
|---|---|---|---|
| 빌라 이름 | 월계 **햇빛**빌라 | 월계 **한빛**빌라 (빌라 id 3, 초대코드 `HANBIT01`). 다른 빌라: 햇살빌라(id 4) | 🟡 **월계 한빛빌라**로 바꾼다. 목데이터가 API 예시와 같아야 서버로 바꿀 때 화면 차이가 안 난다 |
| 로그인 사용자 동·호수 | 101동 **203**호 | 101동 **202**호 (명세 열린 질문 9: Figma 안에서도 203/202가 섞여 있어 202로 정함) | 🟡 **202호** |
| 사용자 차량 | 12가 3456 · 흰색 | 같음 (vehicle id 7) | ✅ |
| 내 차 위치 | 필로티 3번 | 필로티 안쪽 1번 (slot 1001) | 🟡 칸 이름 규칙(아래)에 따름 |
| 출차 예정 | 18:30 | 18:30 (`2026-09-30T18:30:00+09:00`) | ✅ |
| 역할 이름 | 화면 "관리자" | API·백엔드 문서 "관리인", enum은 `ADMIN` | 🔴 Figma 화면 문구 확인 후 결정. 그 전까지 화면 문구는 "관리자" 유지, 코드 enum은 `ADMIN` |
| 결제 단위 | 원 ("시간당 1,000원", 공유 화면은 "월 55,000원") | **토큰** (`hourly_price` 정수, 0 = 무료). 원 결제 없음 | ✅ 토큰. FE #4 Q4는 이것으로 종결. 화면 표기 문구("토큰"/"T" 등)는 🔴 Figma 확인 |
| 기준 시각 (목데이터) | 없음 | 2026-09-30(수) 14:40 KST | 🟡 목데이터 시각을 이 값에 맞춘다 |

## 2. 칸(slot) — 가장 큰 차이

### 2-1. 칸 이름 체계가 세 가지다

| 출처 | 칸 수 | 이름 |
|---|---|---|
| `ParkingMap` (홈·차량 상세·대시보드) | 6 | 필로티 1~6 |
| `ParkingLotMap` (주차 배치 등록, Figma node `125:2` 기반) | 8 | P1~P8 |
| API 명세 / 백엔드 DB | 8 (구역 4개) | `주차 구역 이름 + 번호`: 필로티 안쪽 1·2 / 필로티 외부 1 / 건물 앞 1·2·3 / 골목 1·2 |

- ✅ **화면에 보이는 이름은 API의 `label`을 그대로 쓴다** (백엔드 결정 16, 명세 열린 질문 2). FE에서 이름을 만들지 않는다
- 🔴 **Figma 배치도의 P1~P8이 실제로 어느 구역·번호인지** 정해야 한다. 이 매핑이 백엔드 시드 데이터(`parking_slots`)가 된다 → 사람이 Figma와 실제 빌라를 보고 정한 뒤 백엔드와 맞춘다
- FE #4 Q5(공유 차고지 칸 명칭)는 "구역 이름 + 번호"로 종결

### 2-2. 막힘 모델이 다르다

| 출처 | 모델 |
|---|---|
| FE `parkingLot.ts` `BLOCKED_BY` | 칸 하나를 **여러 칸**이 막을 수 있다 (예: P2는 P1·P4·P6이 막음) |
| API / DB | 칸마다 **바로 앞 칸 하나** (`front_slot_id`). "앞 칸 차가 내 차보다 늦게 나가면 막힘" (백엔드 결정 1) |

- 🔴 Figma 배치도의 P2처럼 나가는 길에 칸이 여러 개 있는 구조를 `front_slot_id` 하나로 표현할 수 없다. 백엔드와 다음 중 하나로 정해야 한다
  1. DB에 앞 칸 목록(다대다)을 추가한다 (백엔드 스키마 변경 → 백엔드 이슈 필요)
  2. 배치를 `front_slot_id` 사슬로 단순화한다 (P2 → P4 → P6처럼 한 줄로 본다)
- 결정 전까지 FE는 **막힘 판정을 직접 하지 않는다.** API 응답의 `blocked_by` / `blocking` / `will_block`을 그대로 표시한다 (판정은 백엔드 `services/blocking.py` 한 곳)

### 2-3. 좌표

- FE: Figma 프레임 px (사이트 800×610). API: 건물 기준 **미터** 좌표 `rect {x0,y0,x1,y1}`, 예시 값은 가짜
- 🟡 Figma 배치도 좌표를 미터로 바꾼 값을 백엔드 시드로 넣고, FE는 `layout.zones[].slots[].rect`로 그린다. 건물·벽·통로·입구 좌표는 API에 없다 (명세 열린 질문 13: "배치도 이미지·출입구 좌표는 DB에 없음") → 🔴 FE 상수로 둘지, 백엔드에 컬럼을 추가할지 결정

### 2-4. 칸 상태 값

| FE `ParkingMap` | FE `ParkingLotMap` | API `SlotState` (`/status`) | API `SlotTag` (`/recommendations`) |
|---|---|---|---|
| available, recommended, mine, occupied, external, unknown, disabled | empty, occupied, disabled (+ `car.mine`) | `EMPTY` `SOON_EXIT` `OCCUPIED` `UNAVAILABLE` + `parking.is_mine` + `parking.occupant_type`(`RESIDENT`/`EXTERNAL`/`UNKNOWN`) | `RECOMMENDED` `EMPTY` `UNAVAILABLE` |

- ✅ FE 타입은 API 값을 그대로 쓴다. "내 차", "외부", "미확인"은 상태가 아니라 `is_mine`, `occupant_type`에서 계산한다
- FE에는 **`SOON_EXIT`(곧 출차, 1시간 이내) 표시가 배치도에 없다** → 배치도 디자인에 추가 필요 (백엔드 결정 13)

## 3. 이슈별 불일치

### FE #4 [결정] Q1~Q6 — API 명세로 정리된 것

| Q | 내용 | 현재 판정 |
|---|---|---|
| Q1 | API 레이어 구조 | 🔴 효재 동의 필요 (변경 없음) |
| Q2 | 백엔드 필드명·admin 권한 | ✅ **API 명세로 해결.** 필드명은 `openapi-mock.yaml`, 권한은 `NOT_BUILDING_MEMBER`/`NOT_BUILDING_ADMIN` (관리인 = 자기 빌라만) |
| Q3 | 상시 주차면 출차 시간 생략? | ✅ **생략한다.** `POST /parkings`에서 `is_long_term: true`면 `expected_exit_at` 생략 가능, `exit_source: NONE` |
| Q4 | 공유 요금 단위 | ✅ **시간당 토큰** |
| Q5 | 공유 차고지 칸 명칭 | ✅ **구역 이름 + 번호** (API `label`) |
| Q6 | 알림 설정 n55 | ✅ **화면을 만들지 않는다** — API 없음 (DB에 저장할 곳이 없음, 명세 기준 문서 3번째 줄). 프로필 "알림 설정"은 `#notifications`로 연결 |

### FE #6 [S2] API 레이어
- `src/api/client.ts`에 아래가 들어가야 한다 (이슈 본문에 없음): Bearer 토큰 헤더, 401 시 `/auth/refresh` 재시도, 에러 `{error:{code,message,detail}}` 파싱, `?cursor=&limit=` 페이지네이션 타입 `Page<T> = { items: T[]; next_cursor: string | null }`
- 🔴 **토큰 저장·로그인 상태는 `auth.ts`(효재 소유)**, 이를 쓰는 `client.ts`는 민솔 소유 → 인터페이스(예: `getAccessToken()`, `refresh()`)를 먼저 합의
- 🔴 `building_id`가 대부분 경로에 필요하다. `GET /users/me`의 `building.building_id`에서 얻는데 이 API는 효재 도메인 → 공용 접근 함수 위치 합의
- 함수 목록은 이슈의 한국어 설명 대신 **명세 `operationId`를 함수 이름으로** 쓴다 (🟡 예: `getHome`, `getBuildingLayout`, `getBuildingStatus`, `getSlotRecommendations`, `createParking`, `updateParkingSchedule`, `exitParking`, `getRecurringSchedule`, `putRecurringSchedule`, `deleteRecurringSchedule`, `getMyVehicle`, `createMoveRequest`, `getMoveRequest`, `doneMoveRequest`, `listMyMoveRequests`, `listNotifications`, `readNotification`, `readAllNotifications`, `getAdminDashboard`, `decideShareRequest`, `listAdminShareRequests`, `listAdminSlots`, `updateAdminSlot`, `listAdminShareOffers`, `createAdminShareOffer`, `updateAdminShareOffer`, `deleteAdminShareOffer`)
- 이슈의 "사용 불가 사유" 조회 API는 **따로 없다.** `/slots/recommendations`의 `unavailable_reason`과 `POST /parkings`의 409 `SLOT_UNAVAILABLE.detail.reason`으로 받는다
- 목데이터는 `openapi-mock.yaml`의 example을 그대로 옮긴다 (🟡). 1장의 공통 값과 같아진다

### FE #8 [M1] ParkingMap props화
- 🟡 **범위를 바꾼다.** 공통 배치도를 `ParkingMap`(3×2 격자)이 아니라 **`ParkingLotMap`(SVG 2.5D)으로 통일**하고 `src/components/`로 옮기는 작업이 되어야 한다. 입력은 `layout`(API `BuildingLayout`) + `status`(API `BuildingStatus`)
- 홈·차량 상세·대시보드·서비스 소개(효재 `WelcomePage`)가 모두 이 컴포넌트를 쓰게 된다 → `ParkingMap`의 `variant="admin"`, `highlightMine`, `compact` 기능을 옮겨야 한다
- 🔴 2-1(칸 매핑), 2-2(막힘 모델)가 정해져야 시작할 수 있다

### FE #9 [M2] 홈·차량 상세·출차·반복
| 화면 | FE 현재 | API | 판정 |
|---|---|---|---|
| 홈 막힘 카드 | "302호 차량에 의해 막혀 있습니다" | 익명: "필로티 안쪽 2번 차량에 의해 막혀 있습니다" (`block_alert.message`) | ✅ 호수 노출 금지. `message`를 그대로 표시 |
| 홈 최근 알림 | "201호 김민준 · 방금 전" | `body: "101동 입주민"` | ✅ 이름·호수 노출 금지 |
| 홈 "관리자 대시보드 · 대기 요청 2건" | 모든 사용자에게 보임 | `admin`은 관리인일 때만 (`pending_share_requests`) | ✅ `admin === null`이면 숨김 |
| 홈 요약 칩 | 가능 4 / 곧 출차 2 / 막힘 1 / 빈칸 3 | `summary {available, soon_exit, blocked, empty}` | ✅ |
| 홈 "확인" 버튼 | 알림 센터로 이동 | `POST /notifications/{id}/read` | ✅ 읽음 처리 |
| 차량 상세 등록 유형 | 직접 등록 / AI 추정 2가지 | `exit_source`: `MANUAL` `RECURRING` `AI_ESTIMATED` `NONE` | 🔴 "반복", "없음(상시)" 칩 문구 Figma 확인 |
| 차량 상세 경과 시간 | FE에서 계산(TODO) | `schedule.elapsed_minutes` 제공 | ✅ 서버 값 사용 |
| 출차 일정 저장 | — | `PUT /parkings/{parking_id}/schedule {expected_exit_at, memo}` | ✅ |
| 반복 일정 | 요일 한글 칩, 30분 단위 | `{days: ["MON",…], time: "07:30", memo}`, 차량별 (`/me/vehicles/{id}/recurring-schedule`) | ✅. 해제(`DELETE`) 버튼은 FE에 없음 → 🔴 Figma 확인 |

### FE #10 [M3] 주차 배치 등록
- ✅ 추천·사유·막힘 예상은 `GET /buildings/{id}/slots/recommendations?vehicle_id&expected_exit_at`. **출차 시간을 바꿀 때마다 다시 호출.** `+`는 `%2B`로 인코딩
- ✅ "평일 같은 시간 반복" 스위치 = `repeat_weekdays: boolean` (월~금). 요일을 고르려면 반복 일정 API
- ✅ 사용 불가 사유 문구는 서버 값: `관리인이 사용 중지한 칸` / `예약된 상태`. FE의 "관리자가 사용 중지한 칸", "다른 차가 주차 중"은 바꾼다. 다른 차가 있는 칸은 409 `SLOT_OCCUPIED`(별도 코드)
- ✅ 이미 주차 중인 차량이면 409 `VEHICLE_ALREADY_PARKED`

### FE #11 [M4] 알림·이동 요청
| 항목 | FE 이슈·코드 | API / 백엔드 결정 | 판정 |
|---|---|---|---|
| "옮겼어요" 후 요청자 알림 | 이슈: "응답 후 요청자 알림". 완료 화면 문구: "요청한 이웃에게 '옮겼어요' 알림을 보냈어요" | **알림 보내지 않음** (백엔드 결정 2). 요청자 홈의 막힘 카드가 사라짐 | ✅ API 따름. 완료 화면 문구 수정 필요 (🔴 Figma에 n31 화면이 있으면 그 문구) |
| 알림 센터의 "미리 옮겼어요"(요청 없이 선제 응답) | 이슈·코드에 있음 | **API 없음** | 🔴 버튼 제거 또는 백엔드에 API 요청 |
| "긴급 이동 요청" 라벨 | 이동 요청 화면에 있음 | 긴급 구분 없음, 일반 "이동 요청" | ✅ "이동 요청"으로 |
| 화면 간 요청 ID 전달 | 방법 없음 | 알림 `link {screen, id}` (`MOVE_REQUEST`, `SHARE_REQUEST`, `HOME`) | 🔴 해시 라우팅에 id 전달 방식 필요 (`#move?id=44` 등) — 공통 파일 `navigation.ts`/`App.tsx` 변경이라 효재와 합의 |
| 알림 종류 | 막힘 사전 알림 / 받은 이동 요청 / 일반 알림 | 5종: `BLOCK_ALERT` `MOVE_REQUEST` `EXIT_DONE` `SHARE_REQUEST` `SHARE_RESULT` | ✅ 5종으로 그룹핑 |
| 내가 남을 막고 있다는 알림 | FE 카드 있음 | `BLOCK_ALERT`에 포함 ("내 차량이 내일 07:30 출차하는 차량을 막고 있어요") | ✅ |

### FE #12 [M5] 관리자 대시보드·공유 요청 관리
- ✅ 대시보드: `GET /admin/buildings/{id}/dashboard?month=YYYY-MM`. 실시간 차량 목록은 **외부·미확인 차량만**(결정 30). 혼잡도 `days`는 이번 달이면 **오늘까지만** 온다 → FE의 30개 고정 막대는 날짜 수에 맞춰 그린다. 미래 달은 빈 배열
- ✅ `ai_insight`는 항상 `null` → "AI 분석 (향후)" 카드는 고정 문구
- 🔴 대시보드의 외부 차량 "이동 요청"은 `POST /move-requests {target_parking_id}`인데 `realtime.vehicles[]`에 **`parking_id`가 없다** (`slot_id`만 있음). `/status`에서 찾거나 백엔드에 필드 추가 요청
- 🔴 공유 요청 관리 목록(`AdminShareRequestItem`)에 **매너 온도가 없다** (대시보드 `pending_requests`에만 있음). FE 목록에는 온도 표시가 있음 → 빼거나 백엔드에 추가 요청. 또한 매너온도 반영 로직은 이번 범위 밖(결정 19)이라 값은 기본 36.5
- ✅ 수락 시 409 `INSUFFICIENT_TOKENS`(요청자 토큰 부족), `GARAGE_TIME_CONFLICT`, `ALREADY_DECIDED` 처리 필요. 거절 사유 프리셋: `주차 구역 용량 초과` · `시간 불가` · `기타` → 거절 사유 입력 UI가 FE에 없음 (🔴 Figma 확인)

### FE #13 [M6] 주차 구역 설정·차고지 등록
| 항목 | FE | API | 판정 |
|---|---|---|---|
| 칸 설정 모달 "공유 가능" 토글 | 있음 | **없음.** 칸은 `is_active`만 바꾼다. 공유는 공유 조건(share-offers) 등록·삭제 | 🔴 토글을 빼고 "공유 중" 상태 표시(`share_offer_id != null`)로 바꿀지 결정 |
| 차고지 이름 · 상세 위치 입력 | 있음 | **받지 않음** (차고지 = 빌라, 열린 질문 12) | 🔴 입력란 제거 여부 |
| 공유할 칸 | 체크박스 | `slot_ids: number[]` (활성 칸만) | ✅ |
| 시작·종료 시간 | 30분 단위 select | **정시 단위** `start_hour`/`end_hour` (0~24) | ✅ 정시 단위로 바꾼다 |
| 요일 | select (매일/평일/주말/…) | `weekdays: ["MON",…]` 배열, Figma는 요일 칩 여러 개 | ✅ 요일 칩으로 바꾼다 |
| 요금 | "1,000 원" | `hourly_price` 토큰, 0 = 무료 | ✅ |
| 최대 이용 시간 "제한 없음" | 문자열 | `max_hours: null` | ✅ |
| 공개 설정 | 스위치 | `is_public` | ✅ |
| 기간(시작일·종료일) | 없음 | 없음 (무기한) | ✅ |
| 관리 메뉴 문구 "새 차고지 또는 공간 추가" | — | 차고지 등록 = 칸을 골라 공유 조건을 거는 것 | 🟡 문구를 "공유할 칸과 조건 등록"으로 |

### FE #14·#15·#16 (효재 트랙) — 참고
- 온보딩: API는 **2단계 (건물 합류: 초대코드 → 차량 등록)**, `onboarding_step` = `JOIN_BUILDING` → `REGISTER_VEHICLE` → `DONE`. FE에는 "골목 등록"(`alley`) 화면이 있음 → 🔴 Figma 기준으로 "건물 합류"로 바꿀지 효재 확인
- #15 역할 선택(n7): API에 역할 선택이 **없다** (관리인은 운영자가 DB에 직접 넣음, 결정 5). 명세는 n7을 "가입 완료" 화면으로 본다 → 🔴 #15 범위 재확인
- 차량 등록 색상 선택지: 검정·흰색·은색·회색·파랑·빨강·기타. 번호판 정규식 `^\d{2,3}[가-힣]\d{4}$`(공백 제거 후), 지역 번호판 불가
- 공유 탐색은 **칸 단위 목록** ("햇살빌라 · 골목 2번"), 필터 `all`/`now`/`reservable`/`free`. 요청 시 날짜·시작·종료 **정시** 선택 화면이 와이어프레임에 없음 (명세 열린 질문 4)
- 전화번호: 본인에게만 마스킹해서 보여주고 타인에게는 제공하지 않음

## 4. 화면 번호 대응표

세 문서가 서로 다른 번호를 쓴다. API 명세의 `#N`은 Notion 매핑 번호, `nNN`은 Manyfast 노드 번호다. parking·admin의 n번호는 `docs/manyfast-diff.md`, 나머지(n4·n9·n10·n32·n34·n51·n52)는 백엔드 README 도메인 표에서 옮겼다 (효재 트랙에서 확인 필요).

| FE PageId | 화면 | API 명세 # | Manyfast |
|---|---|---|---|
| `signup` | 회원가입 | #2 | n4 |
| `login` | 로그인 | #3 | — |
| `alley` | 골목 등록 → (건물 합류) | #4 | n9 |
| `vehicle-register` | 차량 등록 | #5 | n10 |
| `home` | 홈 | #6 | n11 |
| `parking-register` | 주차 배치 등록 | #7 | n15 |
| `departure` | 출차 일정 수정 | #8 | n18 |
| `repeat` | 반복 일정 | #9 | n20 |
| `vehicle-detail` | 차량 상세 | #10 | n22 |
| `unavailable` | 사용 불가 모달 | #11 | n25 |
| `notifications` | 알림 센터 | (화면 미작성) | n26 |
| `move` | 이동 요청 수신 | #12 | n29 |
| `move-done` | 요청 처리 완료 | — | n31 |
| `share` | 공유 주차 탐색 | #13 | n32 |
| `garage-detail` | 차고지 상세 | #14 | n34 |
| `request-result` / `request-accepted` / `request-rejected` | 요청 결과 | #15 / #16 / #17 | — |
| `admin` | 관리자 대시보드 | #18 | n41 |
| `slots` | 주차 구역 설정 | #19 | n43 |
| `garage-register` | 차고지 등록 | #20 | n45 |
| `requests` | 공유 요청 관리 | #21 | n47 |
| `vehicles` | 차량 관리 | #22 | n52 |
| `profile` | 프로필 | #23 | n51 |

Figma 노드 ID는 `docs/figma-wireframe.md`에 따로 적는다.

## 5. 사람이 정해야 할 것 (요약)

| # | 항목 | 누구와 | 막히는 이슈 |
|---|---|---|---|
| D1 | Figma P1~P8 ↔ 구역·번호 매핑, 미터 좌표 시드 | 백엔드 (현서 #9) | #8, #9, #10, #12 |
| D2 | 막힘 모델: 앞 칸 여러 개 vs `front_slot_id` 하나 | 백엔드 (현서 #9) | #8, #10 |
| D3 | 건물·벽·입구 좌표를 FE 상수로 둘지 API로 받을지 | 백엔드 | #8 |
| D4 | 역할 문구 "관리자" vs "관리인", 토큰 표기 문구 | Figma 확인 | 전체 |
| D5 | 해시 라우팅에서 id 전달 방식 | 효재 | #11, #12, 효재 #16 |
| D6 | `client.ts` ↔ `auth.ts` 토큰 인터페이스, `building_id` 얻는 곳 | 효재 | #6, #16 |
| D7 | "미리 옮겼어요" 버튼, 칸 "공유 가능" 토글, 차고지 이름·위치 입력: 뺄지 / API 요청할지 | 백엔드 · 기획 | #11, #13 |
| D8 | 대시보드 외부 차량 `parking_id`, 요청 목록 매너 온도 필드 | 백엔드 (건우) | #12 |
| D9 | 온보딩 "골목 등록" → "건물 합류", 역할 선택(n7) 존재 여부 | 효재 | #14, #15 |
