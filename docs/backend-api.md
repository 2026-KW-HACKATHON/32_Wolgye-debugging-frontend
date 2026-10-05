# 백엔드 API — 프론트가 알아야 할 것

출처: 백엔드 저장소 `2026-KW-HACKATHON/32_Wolgye-debugging-backend`의 `docs/openapi-mock.yaml`(명세), `README.md`, `CLAUDE.md`, 이슈 #4 결정 댓글. 기준일 2026-10-02. **명세와 이 문서가 다르면 명세가 맞다.**

> 명세는 **[명세 페이지(Swagger)](https://2026-kw-hackathon.github.io/32_Wolgye-debugging-backend/)** 에서 본다 (백엔드가 GitHub Actions + Pages로 `openapi-mock.yaml`을 자동 배포, 2026-10-05~).

## 1. 공통 규칙

| 항목 | 규칙 |
|---|---|
| 주소 | `http://localhost:8000/api/v1` (`/health`만 접두사 없음). Swagger: 서버 실행 후 `/docs` |
| 인증 | `Authorization: Bearer <access_token>`. access 30분, refresh 14일. `POST /auth/refresh` → 새 access + 새 refresh. 로그아웃 API 없음 |
| 에러 | `{ "error": { "code", "message", "detail" } }`. 검증 실패 400 `INVALID_INPUT`, 인증 401 `UNAUTHORIZED`, 권한 403 `NOT_BUILDING_MEMBER`/`NOT_BUILDING_ADMIN`, 없음 404 `NOT_FOUND`, 충돌 409 (아래 코드) |
| 시간 | 응답은 모두 KST ISO 8601 (`2026-09-30T14:40:00+09:00`). 시각만은 `"07:30"`. 쿼리에 넣을 때 `+`는 `%2B` |
| 공유 시간 | 날짜 + **정시** `start_hour`/`end_hour` (0~24, 24 = 자정) |
| 요일 | `MON`~`SUN` 배열 |
| 금액 | **토큰** 정수. 원 결제 없음. 가입 시 **500,000 토큰** 지급 (`GET /users/me`의 `token_balance`) |
| 페이지네이션 | `?cursor=&limit=20` (최대 50) → `{ items, next_cursor }`. 최신순, 더 없으면 `next_cursor: null` |
| enum | 모두 대문자 (`PENDING`, `APPROVED`) |
| 번호판 | 응답은 `12가 3456`(공백). 요청은 공백 상관없음. 형식 `^\d{2,3}[가-힣]\d{4}$`, 지역 번호판 불가 |
| 익명 | 이웃은 "101동 입주민", 차는 칸 이름("P2 차량")으로 표시. 이름·호수 없음. 관리자 대시보드 요청자는 `박○○` |

409 코드: `CONFLICT`(범용) `EMAIL_EXISTS` `PLATE_EXISTS` `SLOT_OCCUPIED` `SLOT_UNAVAILABLE` `VEHICLE_ALREADY_PARKED` `GARAGE_TIME_CONFLICT` `ALREADY_DECIDED` `MOVE_REQUEST_ALREADY_PENDING` `ALREADY_IN_BUILDING` `INSUFFICIENT_TOKENS`

## 2. 도메인 용어

- **골목 > 빌라 > 주차 구역 > 칸.** 한 사용자는 **한 빌라에만** 소속 (`/users/me`의 `building`, 배열 아님)
- **차고지 = 빌라의 주차장.** `garage_id` = 빌라 id. "차고지 등록" = 칸을 골라 **공유 조건**(`share_offers`)을 거는 것 (칸마다 하나씩 생김)
- 칸 이름 `label` = **빌라 안 순번 `P1`, `P2` …** (FE·백엔드 합의, backend PR #23). FE가 만들지 않는다
- 역할 `RESIDENT` / `ADMIN` (화면 문구 "관리자"). 관리자 계정은 운영자가 DB에 넣는다 → **역할 선택 화면·API 없음**
- 온보딩 `onboarding_step`: `JOIN_BUILDING`(초대코드로 건물 합류) → `REGISTER_VEHICLE` → `DONE`

## 3. 상태 값

| 이름 | 값 |
|---|---|
| 칸 상태 `SlotState` | `EMPTY` `SOON_EXIT`(1시간 이내 출차) `OCCUPIED` `UNAVAILABLE` |
| 추천 태그 `SlotTag` | `RECOMMENDED` `EMPTY` `UNAVAILABLE` |
| 차 주인 `OccupantType` | `RESIDENT` `EXTERNAL`(공유 이용자) `UNKNOWN`(미확인, 이동 요청 불가) |
| 출차 시간 출처 `ExitSource` | `MANUAL` `RECURRING` `AI_ESTIMATED` `NONE`(상시 주차 등) |
| 주차 `ParkingState` / 차량 `VehicleStatus` | `PARKED` `EXITED` / `PARKED` `OUT` |
| 이동 요청 | `PENDING` `MOVED` `DECLINED` |
| 공유 요청 | `PENDING` `APPROVED` `REJECTED` |
| 알림 `NotificationType` | `BLOCK_ALERT` `MOVE_REQUEST` `EXIT_DONE` `SHARE_REQUEST` `SHARE_RESULT` |
| 알림 `link.screen` | `MOVE_REQUEST`(id=이동 요청) `SHARE_REQUEST`(id=공유 요청) `HOME`(id null). `EXIT_DONE`은 `link: null` |
| 차량 색상 | 검정 흰색 은색 회색 파랑 빨강 기타 |

## 4. 화면 → API

| 화면 (PageId) | API |
|---|---|
| 회원가입·로그인 | `POST /auth/signup` (비밀번호 8~128자, 닉네임 1~50자, `agree_terms`), `POST /auth/login` → `AuthTokens` |
| 건물 합류 (`join-building`) | `POST /buildings/join` (초대코드, 공백 제거·대소문자 무시). 이미 소속이면 409 `ALREADY_IN_BUILDING` |
| 프로필 | `GET/PATCH /users/me` (phone은 마스킹) |
| 차량 등록·관리 | `GET/POST /me/vehicles`, `GET/PATCH/DELETE /me/vehicles/{id}` (주차 중이면 삭제 409) |
| 홈 | `GET /me/home` 한 번에: `summary{available,soon_exit,blocked,empty}`, `my_parking`, `block_alert`(null이면 막힘 카드 숨김), `admin`(관리자만), `recent_notifications`, `unread_notification_count` |
| 배치도 | `GET /buildings/{id}/layout`(정적, 캐싱: 구역·칸·`rect` 미터 좌표·`front_slot_id`) + `GET /buildings/{id}/status`(칸별 `state`, `parking{is_mine,plate,occupant_type,expected_exit_at}`, `blocked_by`, `blocking`) |
| 주차 배치 등록 | `GET /buildings/{id}/slots/recommendations?vehicle_id&expected_exit_at` (출차 시간 바뀔 때마다 재호출, 상시 주차면 시간 생략) → `POST /parkings {slot_id, vehicle_id, is_long_term, expected_exit_at?, repeat_weekdays(bool, 월~금), memo}`. 409 `SLOT_UNAVAILABLE.detail.reason`이 사용 불가 모달 사유 |
| 출차 일정 수정 | `PUT /parkings/{parking_id}/schedule {expected_exit_at, memo}` |
| 출차 처리 | `POST /parkings/{parking_id}/exit` |
| 반복 일정 | `GET/PUT/DELETE /me/vehicles/{id}/recurring-schedule {days:[MON..], time:"07:30", memo}` |
| 차량 상세 | `GET /me/vehicles/{id}`: `owner`, `parking`, `schedule{expected_exit_at, exit_source, elapsed_minutes}` |
| 이동 요청 | `POST /move-requests {target_parking_id, needed_at, reason}` → `GET /move-requests/{id}` → `POST /move-requests/{id}/done`("옮겼어요", **요청자에게 알림 안 감**). 목록 `GET /me/move-requests?box=received|sent` |
| 알림 센터 | `GET /notifications`, `POST /notifications/{id}/read`, `POST /notifications/read-all` |
| 공유 탐색 | `GET /garages?q&filter=all|now|reservable|free` — **칸 단위** 목록 |
| 차고지 상세 | `GET /garages/{garage_id}` → 칸별 `offer.id`로 요청 |
| 공유 요청 | `POST /share-requests {offer_id, vehicle_id, request_date, start_hour, end_hour}` (요청 시 차감 없음, 잔액만 확인) → `GET /share-requests/{id}`의 `status`로 확인 중/수락/거절 화면 분기. 목록 `GET /me/share-requests` |
| 관리자 대시보드 | `GET /admin/buildings/{id}/dashboard?month=YYYY-MM`: `pending_requests`, `realtime`(외부·미확인 차량만), `congestion.days`(이번 달은 오늘까지), `ai_insight`(항상 null) |
| 공유 요청 관리 | `GET /admin/buildings/{id}/share-requests?status&q` → `counts` + `items`. 수락·거절 `PATCH /admin/share-requests/{id} {status, reject_reason}` — **수락 시 토큰이 요청자 → 관리자로 이동**, 부족하면 409 |
| 주차 구역 설정 | `GET /admin/buildings/{id}/slots`, `PATCH /admin/slots/{id} {is_active}`. **공유 여부는 여기서 못 바꾼다** (`share_offer_id` 유무로 표시) |
| 차고지 등록 | `POST /admin/buildings/{id}/share-offers {slot_ids, weekdays, start_hour, end_hour, hourly_price(토큰), max_hours(null=제한 없음), memo, is_public}`. 이름·위치·기간 입력 없음. 수정 `PATCH`, 중단은 `is_public:false` |

## 5. API에 없는 것 (화면에서 빼거나 막아 둔다)

알림 설정(n55), 역할 선택(n7), 로그아웃, 공유 요청 취소, "미리 옮겼어요"(요청 없이 선제 응답), 토큰 충전·내역, 칸 "공유 가능" 토글, 차고지 이름·상세 위치, 공유 요청 시간 선택 화면(요청 본문에는 날짜·시간 필요 → 바텀시트 추가 필요), 대시보드 외부 차량의 `parking_id`(이동 요청에 필요 → `/status`에서 찾는다), 공유 요청 관리 목록의 매너 온도
