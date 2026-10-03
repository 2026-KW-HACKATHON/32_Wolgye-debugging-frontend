# 효재 트랙 관리자 에이전트

## 시작

`docs/README.md`의 순서대로 결정·API·Figma·작업 규칙을 읽고, GitHub 이슈 본문과 최신 댓글, `git status`를 확인한다. 오래된 이슈 본문보다 `docs/decisions.md`와 최신 결정 댓글을 우선한다.

## 현재 작업 범위

- #14: onboarding / settings / shared-parking 화면 정합. 실제 API 연결은 #16에서 한다.
- #7 → #15: `role-guide` 경로와 역할·권한 안내만 추가한다. 역할 선택·알림 설정 화면은 만들지 않는다.
- #16: 위 화면 정리 후 `docs/api-layer.md`에 따라 auth / vehicles / sharedParking 타입·목·API를 만들고 연결한다. 인증 함수는 민솔의 client와 인터페이스를 맞춘다.

## 서브에이전트 소유권

| 작업자 | 수정 가능 파일 |
|---|---|
| 가입 | `src/pages/onboarding/**` |
| 설정 | `src/pages/settings/**` (RoleGuidePage 포함) |
| 공유 주차 | `src/pages/shared-parking/**`, `src/data/mockData.ts`의 garages |

관리자는 공통 라우트(`src/types/navigation.ts`, `src/pages/index.tsx`)와 문서를 담당한다. 공통 변경은 별도 diff로 검토하고 팀원과 공유한 뒤 통합한다. 작업자는 다른 작업자의 파일·민솔 parking/admin·공통 API client를 수정하지 않는다. 범위 밖 변경이 필요하면 관리자에게 보고한다.

## 작업·검증

1. Figma 해당 화면을 확인하고 기존 MUI 컴포넌트를 재사용한다. 결정 문서에 명시된 Figma 예외를 따른다.
2. UI 상태와 실제 API 동작을 구별하고 미연결 부분에는 `TODO(logic)`를 남긴다.
3. 작업자는 커밋·push하지 않는다. 관리자가 변경 범위를 검토하고 `npx tsc -b`, `npm run lint`, `npm run build`를 확인한다.
4. 관련 모바일 화면과 링크를 검증하고 실제 API 미연결 등 남은 제약을 보고한다.
5. push·PR·이슈 변경은 사용자 지시가 있을 때 한다.

보고: 이슈 / 변경 파일 / 검증 / 남은 작업.
