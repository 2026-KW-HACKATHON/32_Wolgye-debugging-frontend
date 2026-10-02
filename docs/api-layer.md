# API 레이어 (이슈 #6)

화면은 `src/api/*.ts` 함수만 부른다. 지금은 **목데이터를 200~400ms 뒤 돌려주고**, 서버를 붙일 때 함수 안쪽만 바꾼다. 명세: 백엔드 `docs/openapi-mock.yaml`, 규칙: [`backend-api.md`](./backend-api.md).

## 1. 파일

| 파일 | 내용 | 담당 |
|---|---|---|
| `src/api/client.ts` | `ApiError`, `isApiError`, `mockDelay`, `mockFail`, `Page<T>` 재export. 서버 연결 시 `request()` 를 여기에 | 민솔 |
| `src/api/parking.ts` | 홈·배치도·주차·출차·차량 상세·반복 일정·이동 요청·알림 | 민솔 |
| `src/api/admin.ts` | 대시보드·공유 요청·칸 설정·공유 조건(차고지 등록) | 민솔 |
| `src/api/auth.ts`, 차량 목록·공유 탐색 | 인증, `/me/vehicles` 목록·등록·수정·삭제, `/garages`, `/share-requests` | 효재 (#16) |
| `src/types/api.ts` | 공통: `ErrorCode`, `Page`, `Weekday`, `Hour`, `DateTime`, `BuildingRole` … | |
| `src/types/parking.ts`, `src/types/admin.ts` | 요청·응답 타입 | |
| `src/mocks/parking.ts`, `src/mocks/admin.ts` | 목 상태 (쓰기 함수가 직접 바꾼다. 새로고침하면 처음 값) | |

## 2. 이름 규칙

| 대상 | 규칙 | 예 |
|---|---|---|
| 함수 | 명세 `operationId` 그대로 | `getHome`, `createParking`, `decideShareRequest` |
| 인자 순서 | 경로 변수(camelCase) → 쿼리 객체 또는 본문 객체 | `getSlotRecommendations(buildingId, { vehicle_id, expected_exit_at })` |
| 타입 필드 | API 이름 그대로 **snake_case** | `expected_exit_at`, `blocked_by` |
| enum | 대문자 문자열 유니온 (`enum` 금지) | `SlotState = 'EMPTY' \| 'SOON_EXIT' \| …` |
| 204 응답 | `Promise<void>` | `readNotification`, `deleteRecurringSchedule` |

## 3. 목 → 서버 전환

1. `client.ts` 에 `request<T>(method, path, { query, body })` 추가: `BASE_URL = http://localhost:8000/api/v1`, `Authorization: Bearer ${getAccessToken()}` (`src/api/auth.ts`, decisions D6), 401이면 `refreshTokens()` 후 **한 번만** 재시도, 실패 응답 `{ error }` 은 `new ApiError(status, code, message, detail)` 로 던진다. 쿼리의 `+` 는 `%2B` (`URLSearchParams` 쓰면 됨).
2. 각 함수의 `// TODO(api): GET /me/home` 주석 아래 목 코드를 `return request('GET', '/me/home')` 로 바꾼다. 시그니처·타입은 그대로.
3. 모두 바꾸면 `src/mocks/` 를 지운다. `grep -rn "TODO(api)" src/api` 가 0건이면 끝.

## 4. 에러 처리

| 상황 | 화면 처리 |
|---|---|
| `ApiError` (`isApiError(e)`) | `e.code` 로 분기, 문구는 `e.message`. 추가 정보는 `e.detail` |
| 409 `SLOT_UNAVAILABLE` | 사용 불가 모달에 `detail.reason` |
| 409 `ALREADY_DECIDED` / `MOVE_REQUEST_ALREADY_PENDING` | 목록 다시 불러오기 + 안내 |
| 400 `INVALID_INPUT` | `detail.field` 입력칸에 `message` |
| 401 `UNAUTHORIZED` | client 가 재시도 후에도 실패하면 로그인으로 (#16) |
| 403·404 | 빈 상태 + 안내 문구 |
| 그 밖의 오류 (네트워크 등) | "잠시 후 다시 시도해 주세요" |

목이 흉내 내는 에러: 다른 빌라 id → 403, 없는 id → 404, 사용 불가 칸 → `SLOT_UNAVAILABLE`, 사용 중 칸 → `SLOT_OCCUPIED`, 이미 주차 중 → `VEHICLE_ALREADY_PARKED`, 미확인 차량 이동 요청 → 400, 대기 중 이동 요청 중복 → 409, 처리된 요청 → `ALREADY_DECIDED`, 수락 시간 겹침 → `GARAGE_TIME_CONFLICT`, 요일 0개·시간 범위·요금 음수·비활성 칸 공유 → `INVALID_INPUT`. **토큰 부족(`INSUFFICIENT_TOKENS`)은 흉내 내지 않는다.**

## 5. 화면에서 쓰기 (로딩·에러·빈 상태)

```tsx
const [home, setHome] = useState<Home | null>(null)
const [error, setError] = useState<string | null>(null)
useEffect(() => { getHome().then(setHome).catch((e) => setError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요')) }, [])
if (error) return <Surface>{error}</Surface>          // 에러
if (!home) return <CircularProgress/>                  // 로딩
if (!home.my_parking) return <Surface>주차 중인 차가 없어요</Surface>  // 빈 상태
```

- 쓰기 후에는 관련 조회를 다시 부른다 (예: `decideShareRequest` → `listAdminShareRequests`). 목도 상태를 바꾸므로 결과가 반영된다.
- 응답은 복사본이라 화면에서 바꿔도 목 상태에 영향 없다.
- 배치도: `getBuildingLayout`(캐싱) + `getBuildingStatus` 를 합쳐 `LotSlot` 으로 바꾼다. `rect` 는 미터, `SLOT_RECTS` px = 미터 × 50.

## 6. 목 시나리오 (기준 시각 2026-09-30 14:40 KST, `MOCK_NOW`)

| 칸 | slot_id | 상태 | 차 | 비고 |
|---|---|---|---|---|
| P1 | 1001 | OCCUPIED | 외부 `123가 4634` 17:00 (parking 558) | P2를 막음. 공유 조건 403 |
| P2 | 1002 | OCCUPIED | **내 차** `12가 3456` 흰색 18:30 (parking 556, 08:30 입차) | `front_slot_id` 1001 |
| P3 | 1003 | EMPTY | | 공유 조건 401 |
| P4 | 1004 | SOON_EXIT | 입주민 `27가 4821` 15:10 반복 | `front_slot_id` 1003 |
| P5 | 1005 | EMPTY | | |
| P6 | 1006 | OCCUPIED | 미확인 `45다 6789` 출차 시간 없음 | `front_slot_id` 1005 |
| P7 | 1007 | SOON_EXIT | 입주민 `34나 5678` 15:30 | `front_slot_id` 1008, 공유 조건 402 |
| P8 | 1008 | UNAVAILABLE | | `is_active: false` |

- 사용자: 김지수 · 월계 한빛빌라(building_id 3) 101동 202호 · `RESIDENT` · 차량 id 7. 관리자 API 는 목에서 역할을 확인하지 않는다
- 받은 이동 요청 44 (대기), 알림 5건 (안 읽음 2), 공유 요청 301~306 (대기 4·수락 1·거절 1), 9월 혼잡도 30일치
- 내 차가 P2에 있으므로 `createParking` 은 먼저 `exitParking(556)` 을 해야 성공한다 (`VEHICLE_ALREADY_PARKED`)
