# 인수인계: parking / admin 화면 작업 (feat/parking-admin)

다른 FE 팀원의 AI 에이전트가 이 브랜치 위에서 작업할 때 먼저 읽을 문서입니다. 기준일 2026-10-01.

## 1. 한 줄 요약

`src/pages/parking/`, `src/pages/admin/` 화면을 Manyfast 와이어프레임에 맞춰 **UI만** 수정했다. 로직은 없고, 필요한 곳에 `TODO(logic)` 주석을 남겼다. 이 작업을 위해 공통 파일 4개에 **하위 호환되는 변경**을 했다.

- 기획 비교와 결정 근거: [`docs/manyfast-diff.md`](./manyfast-diff.md)
- 기획 원본: Manyfast MCP 프로젝트 「차곡차곡」 `c736510d-4e1c-437e-88cf-78d20a06ef4e` (와이어프레임 v1, 유저플로우 v1)

## 2. 공통 파일 변경 — 내 화면에 영향이 있는지 확인할 것

| 파일 | 변경 | 기존 코드 영향 |
|---|---|---|
| `src/components/ParkingMap.tsx` | 선택 prop 3개 추가, `Slot` 타입 export, 칸 상태 `'unknown'`(미확인 차량) 추가 | 없음. prop을 안 넘기면 이전과 같게 렌더링됨 (`WelcomePage`의 `<ParkingMap compact />` 포함) |
| `src/types/navigation.ts` | `PageId`에 `'notifications'`, `'move-done'` 추가. `departure` 제목을 "출차 일정 수정"으로 변경. `move`의 `backTo`를 `notifications`로 변경 | `PageId`로 switch/Record를 쓰는 코드가 있다면 새 키 2개를 처리해야 함 |
| `src/pages/index.tsx` | 위 두 페이지의 lazy import 추가 | 없음 |
| `src/components/AppShell.tsx` | 하단 "알림" 탭 → `notifications` (이전 `move`) | 없음 |

### ParkingMap 새 prop

```tsx
<ParkingMap selectable selected={id} onSelect={setId} onUnavailable={(slot) => openModal(slot)} />
<ParkingMap compact variant="admin" />   // 번호판 라벨 + 입주민(파랑)/외부(주황)/미확인(빨강)/빈 칸(민트)
<ParkingMap compact highlightMine />     // 내 칸(state 'mine')만 진하게, 나머지는 흐리게
```

- `onUnavailable`은 `selectable`일 때만 동작한다. 점유·사용 불가 칸을 탭하면 호출되고, 이 prop이 없으면 이전처럼 탭을 무시한다.
- 칸 데이터는 아직 컴포넌트 안의 하드코딩 배열(`baseSlots`, `adminSlots`)이다. 2단계에서 props로 받도록 바뀔 예정이다.

## 3. 새 화면

| PageId | 파일 | 근거 |
|---|---|---|
| `notifications` | `src/pages/parking/NotificationsPage.tsx` | 알림 센터(n26). **와이어프레임 없음** → 유저플로우(막힘 사전 알림 목록 → 이동 요청 전송, 이동 요청 수신)로 구성 |
| `move-done` | `src/pages/parking/MoveDonePage.tsx` | 요청 처리 완료(n31). 와이어프레임 없음 → `ResultHero` 형식 |

parking 폴더 안에 보조 파일 2개도 추가했다: `UnavailableNotice.tsx`(사용 불가 모달 본문), `timeOptions.ts`(30분 단위 시간 목록).

### 주차 배치 등록의 SVG 배치도 (2026-10-02)

- 기준: Figma `월계디버깅` 파일의 `주차 배치도 SVG` 프레임(node `125:2`). 실제 빌라 사진을 바탕으로 만든 평면도다.
- `src/pages/parking/parkingLot.ts`: 평면 좌표(건물, 벽, 통로, 입구, 칸 P1~P8), 막힘 관계 `BLOCKED_BY`, 칸 데이터 타입 `LotSlot`
- `src/pages/parking/ParkingLotMap.tsx`: `view="top"`(평면) / `view="iso"`(2.5D 입체) 두 시점을 제공한다. 화면에서 토글로 바꾼다. 라이브러리 없이 SVG만 쓴다.
- 칸 이름은 **P1~P8 번호**다. 이 배치도는 주차 배치 등록에만 쓰고, 다른 화면은 아직 공통 `ParkingMap`(필로티 1~6 라벨)을 쓴다.
- 막힘 관계: P1~P6은 같은 줄 통로 쪽 칸과 같은 열 입구 쪽 칸이 막는다(예: P2는 P1·P4·P6). P7·P8은 서로 막지 않는다.

## 4. 화면 간 일관성을 위해 지켜야 할 결정

다른 화면에서 같은 대상을 보여 줄 때 아래 값과 용어를 그대로 맞춰 줄 것.

- **빌라 이름**: "월계 햇빛빌라" (와이어프레임의 "한빛빌라"는 쓰지 않음)
- **역할 명칭**: 화면에서는 "관리자" (요구사항의 "관리인"이 아님 — 내비게이션 제목과 맞춤)
- **칸 이름**: "필로티 N번 / 건물 앞 N번 / 골목 N번" (`ParkingMap` 라벨 "필로티 1~6"과 맞춤). "A-1", "B구역 3번 칸" 같은 표기는 쓰지 않음
- **로그인 사용자 목데이터**: 김지수, 101동 203호, 차량 `12가 3456`(흰색), 필로티 3번에 주차 중, 출차 예정 18:30
- **요금**: 차고지 요금은 "시간당 N원"(0이면 무료). 토큰 거래는 추후
- **출차 시간 select**: 06:00부터 30분 단위
- **주차 구역 설정**: 관리자는 칸을 추가하지 않고 사용·공유 여부만 바꾼다 (칸은 운영팀이 등록)

## 5. 다른 팀원 화면에서 확인이 필요한 것 (건드리지 않음)

- `src/pages/settings/ProfilePage.tsx`: "알림 설정" 항목이 `#move`(이동 요청 수신)로 연결되어 있다. 알림 설정 화면(n55)이 없으니, 담당자가 `#notifications`로 바꿀지 n55를 만들지 정해야 한다.
- `src/data/mockData.ts`의 `requesters`는 이제 `RequestsPage`가 쓰지 않는다. 다른 곳에서도 안 쓰면 2단계에서 정리할 예정이다.
- 공유 주차 화면(`src/pages/shared-parking/`)의 차고지 요금이 "월 55,000원" 형식이다. 차고지 등록 화면은 "시간당 요금"으로 바꿨으니 맞출지 확인이 필요하다.

## 6. 작업 규칙 (이 브랜치 담당자의 요청)

1. 담당 폴더(`src/pages/parking/`, `src/pages/admin/`) 밖 파일은 담당자 허락 없이 수정하지 않는다.
2. 새 라이브러리는 허락을 받고 설치한다. UI는 `src/components/Ui.tsx`의 공통 컴포넌트와 MUI를 먼저 쓴다.
3. 레이아웃은 모바일 우선(PWA)으로 만든다. 폭 360px 이하에서는 `.page-content` 좌우 패딩이 16px이 된다.
4. 기획이 애매하면 추측하지 말고 사람에게 묻는다.
5. 커밋은 단계별로 나누고, push는 하지 않는다.

## 7. TODO 주석 규칙

- `// TODO(logic): <필요한 로직>`: 화면에는 하드코딩 값만 있고 실제 데이터, 이벤트, 검증이 필요한 곳
- 전체 목록 보기: `grep -rn "TODO(logic)" src/pages/parking src/pages/admin`
- 화면용 `useState`(모달 열림, 토글, 선택 표시)는 UI 상태라서 TODO 대상이 아니다.

## 8. 다음 단계 (아직 시작 안 함)

2단계로 `TODO(logic)`를 **API 레이어 + 목데이터** 구조로 구현할 예정이다. 아래 위치는 **제안만 했고 승인 전**이다.

- `src/api/parking.ts`, `src/api/admin.ts`: 지금은 목데이터를 약간의 지연과 함께 비동기로 반환하고, 나중에 함수 안쪽만 실제 서버 호출로 바꾼다.
- `src/mocks/`: 목데이터, `src/types/`: 도메인 타입
- 화면은 API 함수만 호출하고, 로딩·에러·빈 상태를 처리한다.
- 요청/응답 필드명과 admin 권한 범위는 기획에 없어서 백엔드(FastAPI) 팀과 맞춰야 한다.

## 9. 검증

```bash
npm ci
npx tsc -b && npm run lint && npm run build
npm run dev   # 화면 선택 메뉴에서 페이지별 확인
```

CI: `.github/workflows/lint.yml`이 모든 브랜치의 push와 PR에서 `npm run lint`를 실행한다.
