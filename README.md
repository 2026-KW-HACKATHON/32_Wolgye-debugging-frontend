# 차곡차곡 — Frontend

빌라 골목 주차를 관리하는 앱 **차곡차곡**의 프론트엔드입니다. Figma 와이어프레임을 바탕으로 React와 MUI로 만든 모바일 웹이며, Vercel로 배포합니다.
2026 KW HACKATHON 32조 **월계디버깅** — 프론트엔드 담당 김민솔, 이효재.

| 바로가기 | 링크 |
| --- | --- |
| 서비스 체험 | https://32wolgye-debugging-frontend.vercel.app |
| 프로젝트 소개 (메인 저장소) | [32_Wolgye-debugging](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging) |
| 백엔드 · API 명세 | [32_Wolgye-debugging-backend](https://github.com/2026-KW-HACKATHON/32_Wolgye-debugging-backend) · [Swagger](https://2026-kw-hackathon.github.io/32_Wolgye-debugging-backend/) |

## 체험 방법

로그인 화면의 **게스트로 체험하기**에서 **입주민 체험** 또는 **관리자 체험**을 고르면 가입 없이 예시 데이터로 둘러볼 수 있습니다. 역할별 체험 내용은 브라우저에 따로 저장됩니다.

계정으로 로그인할 때는 입주민 `kim@kw.ac.kr`, 관리자 `admin@kw.ac.kr` (비밀번호 모두 `chagok1234`)을 씁니다. 관리 메뉴는 관리자에게만 보입니다. 가입 후에는 건물 합류 → 차량 등록 순서로 진행하며, 건물 초대 코드는 `HANBIT01`입니다.

## 주요 화면

| 영역 | 화면 (`src/pages/`) |
| --- | --- |
| 시작 (`onboarding/`) | 로그인, 가입, 건물 합류, 차량 등록 |
| 주차 (`parking/`) | 홈 배치도(입체·평면 전환), 주차하기(자리 추천 ★), 출차 시간 변경, 요일 반복 일정, 이동 요청, 알림(막힘 사전 알림) |
| 공유 주차 (`shared-parking/`) | 골목 지도에서 옆 빌라 빈 칸 찾기, 상세, 이용 요청과 결과 |
| 제보 (`reports/`) | 미등록 차량 사진 제보, 제보 상세 |
| 관리 (`admin/`) | 대시보드(혼잡도), 공유 요청 수락·거절, 칸 사용 여부, 공유 조건 등록 |
| 설정 (`settings/`) | 프로필, 내 차량, 역할 안내 |

홈에서 칸을 누르면 주차 정보를 볼 수 있습니다. 주차할 차량은 대표 차량과 별도로 고를 수 있고, 주차·출차 입력은 반복 일정이나 차량 관리 화면을 오가는 동안 유지됩니다. 공유 주차의 검색어·필터도 상세·요청 결과에서 돌아올 때 유지됩니다.

## 기술 스택

- React 19, TypeScript, Vite, MUI 7 (해시 라우팅)
- 배치도: SVG로 그린 2.5D(입체) · 평면 배치도 (`src/components/ParkingLotMap.tsx`, 빌라별 배치 데이터 `src/sites/`)
- 지도: 네이버 지도 SDK (`src/api/naverMaps.ts`)
- 검사: `oxlint`, `tsc`, `node --test`
- 배포: Vercel. `/api/v1/*` 요청은 `vercel.json`에서 백엔드(AWS EC2)로 넘깁니다.

## 실행

```bash
npm install
npm run dev
```

- 개발용 화면 선택 메뉴: `http://localhost:5173/?preview=1#home`
- 검사: `npm run build`(타입·빌드), `npm run lint`, `npm run test:parking` 등 `test:*` 스크립트

## 목 모드와 서버 모드

기본값은 목 모드입니다. 실제 서버 호출 코드는 구현되어 있으며 `VITE_USE_MOCK=false`와 `VITE_API_BASE_URL`로 전환합니다([환경 설정](.env.example)). 게스트 체험은 설정과 관계없이 항상 예시 데이터를 씁니다.

- 목 모드에서는 자리 추천과 알림을 프론트의 예시 데이터로 보여 줍니다. 서버 모드에서는 백엔드가 계산한 추천과 알림을 받습니다.
- 실제 서버와의 전체 흐름은 아직 검증 중이며, 결제·휴대폰 푸시 알림·PWA는 포함하지 않습니다.
- 목 데이터는 새로고침하면 초기화됩니다(세션 프로필은 유지).

범위와 제한은 [API 레이어](docs/api-layer.md), 확정 결정은 [문서 안내](docs/README.md)를 확인하세요.
