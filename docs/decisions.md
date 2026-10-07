# 결정 사항

여러 문서(이슈·Manyfast·Figma·API)가 서로 다를 때 무엇을 따를지 정리한 문서다. 기준일 2026-10-02.

## 기준 문서 우선순위

1. **화면·문구**: Figma 와이어프레임 → [`figma-wireframe.md`](./figma-wireframe.md)
2. **데이터·필드·동작**: 백엔드 API 명세 → [`backend-api.md`](./backend-api.md)
3. 요구사항 참고: Manyfast 「차곡차곡」 (와이어프레임은 Figma의 이전 버전이라 쓰지 않음)

FE GitHub 이슈 #4~#18 본문은 Manyfast 기준으로 쓰였다. 이 문서와 다르면 **이 문서를 따른다**.

## 확정

| 항목 | 결정 |
|---|---|
| 빌라·사용자 목데이터 | 월계 한빛빌라 / 김지수 · 101동 202호 · `12가 3456` 흰색 · P2 · 출차 18:30 |
| 역할 문구 | 화면 "관리자", 코드 값 `ADMIN` |
| 칸 이름 (D1) | **빌라 안 순번 `P1`, `P2` …** (Figma 배치도 표기). API `label` 그대로 쓴다. 주차 구역 이름은 화면에 쓰지 않는다. 백엔드 명세는 [backend PR #23](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/pull/23)으로 반영 (백엔드 승인). label 생성 코드는 백엔드 담당자가 바꾼다 |
| 이웃 표시 | 익명 ("101동 입주민"). 이름·호수 금지 |
| 요금 | **토큰**. 화면 표기도 토큰. 가입 시 500,000 토큰 (백엔드 지급) |
| 막힘 판정 | **백엔드가 한다.** FE는 `blocked_by`·`will_block`·`block_alert`를 표시만 |
| 상시 주차 (#4 Q3) | 출차 시간 생략 (`is_long_term: true`) |
| 알림 설정 (#4 Q6) | 화면 안 만든다. 프로필 "알림 설정" → `#notifications` |
| API에 없는 입력 | 만들지 않는다: 칸 "공유 가능" 토글, 차고지 이름·상세 위치, "미리 옮겼어요", 역할 선택 (목록은 `backend-api.md` 5장) |
| "옮겼어요" 후 | 요청자에게 알림 없음 (완료 화면 문구도 맞춘다) |
| 공유 시간 | 정시 단위, 요일은 칩 여러 개 |
| 배치도 | 모든 화면에서 `ParkingLotMap`(SVG 2.5D). 구조는 [`tech-stack.md`](./tech-stack.md) 4장 |
| 배치도 건물·벽·입구 (D3) | FE 상수로 둔다 (`src/components/parkingLotGeometry.ts`). API는 칸 좌표·상태만 준다 |
| 화면 간 id 전달 (D5) | 해시 쿼리: `#move?id=44`. 만들 때 `toHash('move', { id: 44 })`, 읽을 때 `hashParams().get('id')` (`src/types/navigation.ts`) |
| 토큰·빌라 id (D6) | 토큰 저장·갱신은 `src/api/auth.ts`(효재)가 맡고 `getAccessToken()`, `refreshTokens()`, `getMyBuildingId()`를 export한다. `src/api/client.ts`(민솔)는 이 함수만 불러 헤더를 붙이고 401이면 한 번 갱신 후 재시도한다. 저장소는 `localStorage` 키 `chagok.auth` |
| 외부 차량 이동 요청 (D8) | 대시보드 응답의 외부 차량에는 칸 번호(`slot_id`)만 있고, 이동 요청 API는 주차 번호(`parking_id`)가 필요하다. → 백엔드 변경 없이 **FE가 `/buildings/{id}/status`에서 같은 `slot_id`의 `parking.id`를 찾아 쓴다** |
| 온보딩 (D9) | "골목 등록" → **"건물 합류"(초대코드)** 로 변경 완료. PageId `join-building`, `src/pages/onboarding/JoinBuildingPage.tsx` |
| 시연 시작 상태 (2026-10-04) | **내 차는 주차 안 함**으로 시작한다. 목 `parkings` 556(P2)은 `EXITED`. 주차 배치 등록에서 배치하면 홈·막힘 흐름이 이어진다. 출차 처리 버튼은 만들지 않는다 |
| 주차 화면의 내 차량 (2026-10-05) | 효재 `src/api/vehicles.ts`의 `listMyVehicles`로 찾는다 (`src/pages/parking/defaultVehicle.ts`: 대표 차량 → 첫 차). 임시 함수는 삭제. 주차 목은 **로그인한 사용자의 차량 전부**를 내 차로 다룬다(대표 차량 변경·새 차량도 배치 가능). 반복 일정은 차량별 |
| 시연 시작 (2026-10-05) | **체험 계정 로그인부터** 시작한다. 로그인 전에는 차량이 필요한 주차 화면에 '로그인이 필요해요' 안내 |
| 반복을 끄고 배치 (`repeat_weekdays:false`) | 기존 반복 일정은 그대로 둔다. 백엔드 확인 완료 ([backend #34](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/pull/34)) |
| 처리 완료 화면 응답 시각 | `MoveRequestDetail.responded_at` 표시, null이면 줄 숨김 ([backend #34](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/pull/34)) |
| 출차 일정 메모 | `VehicleDetail.schedule.memo`로 채우고, 저장할 때 **늘 다시 보낸다** (PUT이라 안 보내면 지워짐, [backend #34](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/pull/34)) |
| 상시 주차일 때 이동 요청 `needed_at` (2026-10-04) | **현재 시각**으로 보낸다 (출차 예정이 있으면 그 시각) |
| 이미 공유 중인 칸을 차고지 등록에서 고를 때 (2026-10-04) | **기존 조건 수정**으로 연결한다 (`PATCH /admin/share-offers/{id}`). 새 칸과 섞어 저장하지 않는다 |
| 주차 중인 칸 사용 중지 (2026-10-04) | **확인 경고 후 허용**. 차는 그대로 둔다 |
| 공유 조건 수정 중 '차고지 공개' 끄기 (2026-10-04) | 허용하되 **경고 안내**를 띄운다 (끄고 저장하면 공유 중단) |
| 오늘 이미 지난 출차 시각 (2026-10-04) | **막는다**. 지난 시각 버튼 비활성, 직접 입력하면 오류 문구 |
| 대시보드 혼잡도 달 (2026-10-05) | 응답의 `congestion.month`로 표시 ([backend PR #35](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/pull/35), FE #24) |
| 출차 일정 수정의 지난 시각 (2026-10-05) | 배치 등록과 같이 **막는다** (서버도 400) |
| 공유 요청 → 관리자 승인 연동 (2026-10-05) | 효재 공유 목과 민솔 관리자 목의 ID(차고지·오퍼·소유자·관리자)를 **맞추지 않는다**. test 서버 연결 후 실제 DB로 확인한다 ([#17 댓글](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-frontend/issues/17#issuecomment-5991694850)). test 서버 정보는 [backend #36](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend/issues/36)으로 요청 |
| 관리 메뉴 표시 (2026-10-06) | **관리자(`ADMIN`)에게만** 하단 '관리' 탭과 화면 미리보기 목록의 관리 화면을 보인다. 입주민·로그인 전에는 숨기고, 관리 화면 주소로 직접 오면 "관리자만 볼 수 있어요". 역할은 `auth.ts` `getMyRole()`(프로필 `building.role`). 목도 서버처럼 관리자 API는 403 `NOT_BUILDING_ADMIN` |
| 관리자 체험 계정 (2026-10-06) | `admin@kw.ac.kr` / `chagok1234` (박관리, 월계 한빛빌라 `ADMIN`, 목 id 2 = 공유 조건 host). 김지수는 입주민 그대로. 이전 "관리자 화면도 김지수로 시연"은 폐기 |
| #17 브라우저 QA 수정 (2026-10-06) | **효재 담당**. QA 결과는 민솔이 효재에게 따로 전달. 효재는 민솔 파일(parking·admin)도 고칠 수 있다. 인수인계는 [#17 댓글](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-frontend/issues/17#issuecomment-5997853755). 민솔은 #30 test 서버 연결 담당 |

결정 대기 항목은 없다. 새로 생기면 이 표 아래에 `## 결정 대기`를 다시 만든다.
