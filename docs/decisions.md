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
| 배치도 건물·벽·입구 (D3) | FE 상수로 둔다 (`src/pages/parking/parkingLot.ts`). API는 칸 좌표·상태만 준다 |
| 화면 간 id 전달 (D5) | 해시 쿼리: `#move?id=44`. 만들 때 `toHash('move', { id: 44 })`, 읽을 때 `hashParams().get('id')` (`src/types/navigation.ts`) |
| 토큰·빌라 id (D6) | 토큰 저장·갱신은 `src/api/auth.ts`(효재)가 맡고 `getAccessToken()`, `refreshTokens()`, `getMyBuildingId()`를 export한다. `src/api/client.ts`(민솔)는 이 함수만 불러 헤더를 붙이고 401이면 한 번 갱신 후 재시도한다. 저장소는 `localStorage` 키 `chagok.auth` |
| 외부 차량 이동 요청 (D8) | 대시보드 응답의 외부 차량에는 칸 번호(`slot_id`)만 있고, 이동 요청 API는 주차 번호(`parking_id`)가 필요하다. → 백엔드 변경 없이 **FE가 `/buildings/{id}/status`에서 같은 `slot_id`의 `parking.id`를 찾아 쓴다** |
| 온보딩 (D9) | "골목 등록" → **"건물 합류"(초대코드)** 로 변경 완료. PageId `join-building`, `src/pages/onboarding/JoinBuildingPage.tsx` |

결정 대기 항목은 없다. 새로 생기면 이 표 아래에 `## 결정 대기`를 다시 만든다.
