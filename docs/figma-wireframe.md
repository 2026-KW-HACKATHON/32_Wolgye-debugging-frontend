# Figma 와이어프레임 (화면 기준)

2026-10-02부터 화면의 기준은 Figma다. 에이전트는 화면을 고치기 전에 해당 노드를 Figma MCP로 확인한다.

- 파일: `월계디버깅` — https://www.figma.com/design/gRkmWaziHJBtVXwseoieTy (fileKey `gRkmWaziHJBtVXwseoieTy`)
- 확인 방법: `get_screenshot(fileKey, nodeId)`로 화면을 보고, 문구는 `get_metadata(fileKey, nodeId)`의 text 이름으로 확인한다. 구현할 때는 `get_design_context`를 쓴다 (`figma:figma-design-to-code` 스킬 먼저)

## 1. 페이지

| 페이지 | id | 내용 |
|---|---|---|
| 와이어프레임 | `52:2` | **화면 기준.** 390×844 모바일 화면 23개 + 모달 |
| 주차베치도 후보 | `122:2` | 주차장 평면도 `주차 배치도 SVG`(`125:2`) 하나. 실제 빌라 사진을 바탕으로 한 단순 평면도 |
| MUI Components | `66:36` | 와이어프레임에 쓴 MUI 컴포넌트 (Button, Chip, Switch, TextField, Select, AppBar, BottomNavigation 등) |
| UI | `50:811` | 빈 시안 (알림 박스 하나뿐) — 쓰지 않음 |
| 화면 스케치 | `0:1` | 빈 프레임 — 쓰지 않음 |

> ⚠️ **2.5D(입체) 배치도를 그린 Figma 프레임은 없다** (2026-10-02 전체 페이지 확인). 와이어프레임의 배치도 자리는 모두 `Image` 자리표시자이고, 주차장 그림은 평면도 `125:2`뿐이다. 코드의 2.5D 배치도(`ParkingLotMap view="iso"`)는 이 평면도 좌표를 등각 투영해서 만든 것이다.

## 2. 화면 ↔ 노드 ↔ 코드

| Figma 화면 | node | FE PageId / 파일 | 배치도 자리 (Image) |
|---|---|---|---|
| 서비스 소개 화면 | `52:92` | `welcome` (효재) | |
| 회원가입 화면 | `52:122` | `signup` (효재) | |
| 로그인 화면 | `52:154` | `login` (효재) | |
| 골목 등록 화면 | `52:194` | `join-building` 건물 합류로 변경 (`decisions.md` D9) | |
| 차량 등록 화면 | `52:229` | `vehicle-register` (효재) | |
| 홈(배치도) 화면 | `52:255` | `home` · `parking/HomePage.tsx` | `52:277` → `ParkingLotMap` |
| 주차 배치 등록 화면 | `52:362` | `parking-register` · `parking/ParkingRegisterPage.tsx` | `52:371` 큰 배치도, `52:385` 선택 칸 미리보기 → 둘 다 `ParkingLotMap` |
| └ 사용 불가 안내 (간단) | `52:442` | (쓰지 않음, 아래 상세판 사용) | |
| 출차 일정 등록 화면 | `52:449` | `departure` · `parking/DeparturePage.tsx` | |
| 반복 일정 설정 화면 | `52:498` | `repeat` · `parking/RepeatPage.tsx` | |
| 차량 상세 화면 | `52:573` | `vehicle-detail` · `parking/VehicleDetailPage.tsx` | `52:622` 주차 위치 → `ParkingLotMap focusId`. `52:583`은 차량 사진 자리 (구현 안 함) |
| 사용 불가 안내 모달 | `52:627` / 본문 `52:634` | `unavailable` · `parking/UnavailablePage.tsx`, `UnavailableNotice.tsx` | |
| 이동 요청 수신 화면 | `52:651` | `move` · `parking/MoveRequestPage.tsx` | |
| 공유 주차 탐색 화면 | `52:697` | `share` (효재) | |
| 차고지 상세 화면 | `52:812` | `garage-detail` (효재) | |
| 요청 결과 확인 화면 | `52:895` | `request-result` (효재) | |
| 요청 수락 안내 화면 | `52:920` | `request-accepted` (효재) | |
| 요청 거절 안내 화면 | `52:937` | `request-rejected` (효재) | |
| 관리자 대시보드 | `52:956` | `admin` · `admin/AdminPage.tsx` | `52:987` 관리 구역·실시간 → `ParkingLotMap variant="admin"`. `52:969` 요청자 사진, `52:1019` 혼잡도 차트 |
| 주차 구역 설정 화면 | `52:1059` | `slots` · `admin/SlotsPage.tsx` | |
| └ 칸 설정 모달 | `52:1143` | `SlotsPage`의 Dialog | |
| 차고지 등록 화면 | `52:1196` | `garage-register` · `admin/GarageRegisterPage.tsx` | |
| 공유 요청 관리 화면 | `52:1287` | `requests` · `admin/RequestsPage.tsx` | |
| 차량 관리 화면 | `52:1383` (+ 모달 `52:1431`, `52:1453`) | `vehicles` (효재) | |
| 프로필·설정 화면 | `52:1464` | `profile` (효재) | |
| (없음) | — | `notifications` 알림 센터, `move-done` 요청 처리 완료 | Figma에 화면이 없다 (유저플로우 기준으로 만든 화면) |

## 3. Figma로 확정된 공통 값

| 항목 | Figma 값 | 근거 노드 |
|---|---|---|
| 빌라 이름 | 월계 한빛빌라 | `52:956` |
| 역할 문구 | **관리자** (화면 제목 "관리자 대시보드", 머리말 "관리자") | `52:956` |
| 로그인 사용자 | 김지수 · 101동 202호 · 12가 3456 흰색 | `52:573` |
| 칸 이름 | Figma 화면 문구는 "필로티 안쪽 2번" 형식이지만 **코드는 P1, P2 …** (`decisions.md` D1) | `52:255`, `125:2` |
| 이웃 표시 | 익명: "101동 입주민", "301동 입주민" (호수·이름 없음) | `52:255`, `52:651` |
| 공유 요금 입력 | "시간당 요금 (원, 0이면 무료)" → **코드는 토큰으로 표기** (Figma가 옛 표기) | `52:1196` |
| 공유 요일 | 요일 칩 여러 개 선택 (월~일) | `52:1196` |

## 4. Figma 안에서 서로 다른 값 (그대로 두고 데이터로 채운다)

| 항목 | 화면별 값 | 처리 |
|---|---|---|
| 내 차 출차 예정 | 홈 "오후 6:30" / 차량 상세 "오늘 18:00" | 목데이터 18:30 하나로 통일 (API 예시와 같음) |
| 내 차 위치 | 홈·차량 상세·배치 등록 "필로티 안쪽 2번" / API 예시 "필로티 안쪽 1번" | 화면 목데이터는 Figma(필로티 안쪽 2번) |
| 요청 일시 | 대시보드 "9/28(월)" / 요청 관리 "2025.07.14" | 목데이터 값일 뿐. API 값으로 바뀐다 |

## 5. Figma와 현재 코드가 다른 점 (parking·admin, 2026-10-02)

배치도·공통 값은 반영했다. 아래는 아직 코드에 반영하지 않았고, 해당 이슈 작업자가 Figma를 보고 반영한다.

| 화면 | Figma | 코드 | 이슈 |
|---|---|---|---|
| 주차 배치 등록 `52:362` | 날짜 칩 "9/29 (화) · 날짜 변경", 평일 반복 스위치 **꺼짐** | "10/2 (금)", 스위치 켜짐 | #10 |
| 주차 배치 등록 | 시점 전환 없음 | 입체/평면 토글 있음 (유지 — Figma에 금지 표시 없음) | — |
| 관리자 대시보드 `52:956` | 관리 메뉴 2개 (공유 요청 관리, 차고지 등록) | 3개 ("주차 구역 설정" 추가) — 다른 진입점이 없어 유지 (`manyfast-diff.md`) | #12 |
| 칸 설정 모달 `52:1143` | "사용 가능", "공유 가능" 토글 2개 | API 기준으로 "사용 가능"만 두고 공유 여부는 안내 문구로 표시 (반영 완료) | #13 |
| 차고지 등록 `52:1196` | 요일 칩, 정시 시작/종료, 공유 칸 3개(필로티 외부 1번·골목 1번·골목 2번) | 요일이 select, 30분 단위 시간. 이름·상세 위치 입력은 API에 없어 삭제, 요금은 토큰 (반영 완료) | #13 |
| 공유 요청 관리 `52:1287` | "요청 칸: 골목 1번 · 날짜 시간", 매너 온도 표시 없음 | "요청 구역:", 대기 중 항목에 매너 온도 | #12 |
| 이동 요청 수신 `52:651` | "긴급 이동 요청" 라벨 있음 | 같음 (API에 긴급 구분은 없지만 화면 문구는 Figma를 따른다) | #11 |

## 6. 2.5D 배치도 구현 메모

- 컴포넌트: `src/components/ParkingLotMap.tsx`, 건물·벽·입구 좌표와 `toLotSlots`: `src/components/parkingLotGeometry.ts`, 목데이터 `lotStatus`: `src/mocks/parking.ts`
- 좌표 출처: `125:2` 안의 `site-surface`(800×610) 기준 px. 칸 `space-01`~`space-08` = P1~P8, `building`, `drive-aisle`, `entrance`, `building-entrance-between-P7-P8`
- 쓰는 곳: 홈(`ParkingLotMap` + `LotLegend`), 주차 배치 등록(탭 가능 + 선택 칸 미리보기 `view="top" focusId`), 차량 상세(`focusId` = 내 칸), 관리자 대시보드(`variant="admin"`)
- 칩에는 칸 이름(`label`, P1~P8)만 쓰고 상태는 칩 색으로 나눈다. 칩 안에 시간·상태 글자를 넣으면 대각선으로 붙은 칸끼리 칩이 겹친다 (360px 폭에서 확인)
- 막힘은 백엔드가 판정해서 보내 준다 (`blocked_by`). FE는 내 차 칩을 빨강으로, 막는 칸을 빨간 테두리로 표시만 한다
