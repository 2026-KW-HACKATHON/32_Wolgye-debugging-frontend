# 기술 스택 (차곡차곡 FE)

에이전트가 작업을 시작하기 전에 읽는 문서다. **여기 적힌 것만 쓰고, 새 라이브러리는 사람 승인 후 설치한다.** 기준일 2026-10-02, 브랜치 `feat/parking-admin`.

## 1. 런타임·빌드

| 항목 | 버전 (설치본) | 비고 |
|---|---|---|
| Node.js | 24.21 (로컬) / **22 (CI)** | CI는 `.github/workflows/lint.yml`의 `node-version: 22`. Node 22에서 안 되는 문법·API는 쓰지 않는다 |
| npm | 11.19 | `package-lock.json` 사용. 설치는 `npm ci` |
| Vite | 8.3.1 | `vite.config.ts`: `react()`, `tailwindcss()` 플러그인 |
| @vitejs/plugin-react | 6.1.1 | |
| TypeScript | 6.0.3 | `tsc -b` (프로젝트 참조: `tsconfig.app.json`, `tsconfig.node.json`) |
| oxlint | 1.86.0 | `.oxlintrc.json`: react, typescript, oxc 플러그인. `react/rules-of-hooks` error, `react/only-export-components` warn |

### TypeScript 설정 중 코드에 영향 주는 것 (`tsconfig.app.json`)
- `verbatimModuleSyntax: true` → 타입만 가져올 때는 **반드시 `import type` / `type` 수식어**를 쓴다 (`import { type Slot } from ...`)
- `erasableSyntaxOnly: true` → `enum`, `namespace`, 생성자 매개변수 프로퍼티 **금지**. 열거형은 문자열 유니온 + `as const` 객체로 쓴다
- `noUnusedLocals`, `noUnusedParameters` → 안 쓰는 변수·매개변수가 있으면 빌드 실패
- `allowImportingTsExtensions` → `import App from './App.tsx'` 허용 (기존 코드는 대부분 확장자 생략)
- 경로 별칭(alias) **없음** → 상대 경로(`../../components/Ui`)로 가져온다

## 2. UI

| 항목 | 버전 | 사용 방식 |
|---|---|---|
| React / React DOM | 19.3.0 | 함수 컴포넌트만. `StrictMode` 켜져 있음 (`src/main.tsx`) |
| MUI (`@mui/material`) | 7.3.4 | **주 UI 라이브러리.** 레이아웃은 `Stack`·`Box`, 스타일은 `sx` prop. 입력의 추가 속성은 MUI 7 방식인 `slotProps={{input:…, inputLabel:…}}`로 넘긴다 (`InputProps` 아님) |
| MUI Icons | 7.3.4 | `@mui/icons-material/<Name>Rounded`를 파일별 default import로 가져온다 (Rounded 계열로 통일) |
| Emotion | react 11.14 / styled 11.14 | MUI 엔진. 직접 `styled()`를 쓰는 코드는 없음 |
| Tailwind CSS | 4.3.3 + `@tailwindcss/vite` | ⚠️ **설치만 되어 있고 실제로는 꺼져 있다.** CSS 어디에도 `@import "tailwindcss"`가 없어 유틸리티 클래스가 생성되지 않는다. Tailwind 클래스를 쓰지 말고 MUI `sx`를 쓴다. 쓰기로 하려면 사람이 먼저 결정 |

### 디자인 토큰 (`src/theme.ts`)
- 색은 `tones`에서 가져온다: `blue #246BFD`, `blueDark #1654D1`, `mint #33B99A`, `mintSoft`, `orange #F18A3D`, `orangeSoft`, `red #E34D59`, `redSoft`, `ink #17233C`, `muted #667085`, `border #E5E9F0`, `canvas #F4F6F9`
- 폰트: Pretendard → Inter → 시스템 폰트. **Pretendard 웹폰트는 로드하지 않는다** (설치된 기기에서만 적용)
- 기본 radius 16, Button 높이 46 / small 36, Card radius 18, Chip 높이 32
- 공통 컴포넌트 `src/components/Ui.tsx`: `PageTitle`, `SectionTitle`, `Surface`(Card), `NavButton`(해시 링크 버튼), `StatusChip`, `InfoRow`, `ResultHero`, `ParkingMark`. 새 화면은 이것부터 쓴다

### 코드 스타일 (기존 코드 기준)
- 한 컴포넌트를 한 줄 JSX로 길게 쓰는 압축 스타일. 주변 코드를 따라 한다
- 주석은 한국어, 적게. 로직이 비어 있는 곳은 `// TODO(logic): …` (인수인계 문서 7장)
- 파일 하나에 default export 컴포넌트 하나. 상수·타입만 따로 export 가능 (`only-export-components` 경고)

## 3. 앱 구조

| 항목 | 내용 |
|---|---|
| 라우팅 | **라우터 라이브러리 없음.** `window.location.hash` (`#home`)를 `src/App.tsx`가 읽어 `src/pages/index.tsx`의 lazy 컴포넌트를 고른다. 화면 목록·제목·탭·뒤로가기 대상은 `src/types/navigation.ts`의 `pages` |
| 화면 이동 | `<NavButton to="home">` 또는 `href="#home"`. 쿼리·파라미터 전달 방식은 **아직 없음** (이슈 #11에서 합의 필요) |
| 앱 셸 | `src/components/AppShell.tsx`: 데스크톱에서는 왼쪽 화면 목록 + 가운데 폰 프레임(최대 402px), 좁은 화면에서는 상단 화면 선택 select. 하단 탭 5개(배치도·알림·공유 주차·관리·프로필) |
| 상태 관리 | 라이브러리 없음. 화면 안 `useState`만 사용 |
| 데이터 | 아직 API 호출 없음. 하드코딩 + `src/data/mockData.ts`. 2단계(#6)에서 `src/api/`, `src/types/`, `src/mocks/` 도입 예정 |
| 반응형 | 모바일 우선. 360px 이하에서 `.page-content` 좌우 패딩 16px (`src/App.css`) |
| PWA | 없음 (manifest·service worker 없음) |

## 4. 주차 배치도 렌더링 (2.5D)

현재 배치도 구현은 두 개다.

| 컴포넌트 | 위치 | 방식 | 쓰는 화면 |
|---|---|---|---|
| `ParkingMap` | `src/components/ParkingMap.tsx` | MUI `ButtonBase` 3×2 격자. 평면 카드 | 홈, 차량 상세, 관리자 대시보드, 서비스 소개(효재) |
| `ParkingLotMap` | `src/pages/parking/ParkingLotMap.tsx` + 좌표 `parkingLot.ts` | **SVG + 직접 만든 등각 투영**. `view="top"`(평면) / `view="iso"`(2.5D) | 주차 배치 등록만 |

### `ParkingLotMap`의 2.5D 방식
- 라이브러리 없이 SVG `<path>`로 그린다. 평면 좌표 `(x, y)`와 높이 `z`를 `isoPoint(x, y, z) = [(x − y)·0.78, (x + y)·0.42 − z]`로 화면 좌표로 바꾼다
- 건물·벽·차는 `IsoBox`(보이는 세 면: 윗면, 남쪽 면, 동쪽 면)로 그린다. 차는 차체(높이 20) + 캐빈(20~36)
- 겹치는 순서는 `x + y`가 작은 것(먼 것)부터 그린다 (painter's algorithm)
- 칸은 `role="button"` + `tabIndex` + Enter/Space 키 처리로 접근성을 지원한다. 차·라벨 레이어는 `pointerEvents="none"`이라 칸을 탭하는 데 방해되지 않는다
- 좌표 단위는 Figma 프레임의 px(사이트 800×610)이다. **API는 칸 좌표를 건물 기준 미터(`rect.x0..y1`)로 준다** → 좌표 변환이 필요하다 (`docs/spec-gap.md` 3장)

### 2.5D 모델링 원칙
1. **기본은 지금의 SVG 등각 투영을 확장한다.** 의존성이 없고, 번들이 작고, 탭 판정·접근성·MUI 테마 색을 그대로 쓸 수 있다. 칸 8~수십 개 규모에서는 충분하다
2. 데이터와 그리기를 나눈다: API `GET /buildings/{id}/layout`(정적 배치, 미터 좌표) + `GET /buildings/{id}/status`(칸 상태 오버레이)를 받아 그리고, 배치 좌표를 컴포넌트 안에 하드코딩하지 않는다
3. 투영 상수(`ISO_X`, `ISO_Y`, 높이 값)는 Figma 2.5D 화면과 맞춘다 (Figma 확인 후 `docs/figma-wireframe.md`에 기록)
4. 3D 엔진(three.js, @react-three/fiber 등)은 **쓰지 않는다.** 회전·자유 시점·실제 3D 모델(glTF)이 필요하다고 정해질 때만 사람 승인을 받고 도입한다. 도입하면 번들이 수백 KB 늘고, 탭 판정·접근성을 다시 만들어야 한다

## 5. 검증 명령

```bash
npm ci
npx tsc -b && npm run lint && npm run build   # 셋 다 통과해야 완료
npm run dev                                    # http://localhost:5173/#home
```
- CI는 **lint만** 돌린다 (`npm run lint`). 타입 체크·빌드는 로컬에서 직접 확인한다
- 기준 시점(2026-10-02)에 위 세 명령은 모두 통과한다

## 6. 백엔드 (참고)

- 저장소: `2026-KW-HACKATHON/32_Wolgye-debugging-backend`. FastAPI + PostgreSQL/PostGIS, `http://localhost:8000/api/v1`
- API 명세: 백엔드 저장소 `docs/openapi-mock.yaml` (OpenAPI 3.1, 엔드포인트 45개, 예시 값은 모두 가짜). 확정 결정은 백엔드 이슈 #4 결정 댓글
- 인증: `Authorization: Bearer <access_token>`, access 30분 / refresh 14일, `POST /auth/refresh`
- 에러: `{ "error": { "code", "message", "detail" } }`, 시간은 KST(`+09:00`) ISO 8601, 페이지네이션은 `?cursor=&limit=` → `{ items, next_cursor }`
- 프론트와 다른 점은 `docs/spec-gap.md`에 정리했다

## 7. 정리가 필요한 것 (이슈 #17 대상)
- 루트 `test.py` (프로젝트와 무관)
- 안 쓰는 Tailwind 패키지: 쓸지 지울지 결정
- `src/data/mockData.ts`의 `requesters` (사용처 없음)
- README의 "23개 페이지" → 현재 25개 (`navigation.ts` 기준)
