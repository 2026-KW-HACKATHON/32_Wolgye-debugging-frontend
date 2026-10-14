# 제보 위치와 실제 주차 상태 분리

대상: `2026-KW-HACKATHON/32_Wolgye-debugging-backend`, dev 기준 `d589b5aab95cda05e0f9216bd9bb2010c36a21db`.

제보 접수 시 `admin.place_unknown_vehicle`를 호출하던 처리를 제거한다. 선택한 칸은 제보의 `slot_id`로만 저장한다. 사진·관리인 알림·500토큰 보상은 유지하며, 같은 빌라의 접수 중인 번호판은 중복 보상을 차단한다. 응답의 `vehicle_id`, `parking_id`는 null이다. 기존 DB 컬럼이 nullable이므로 스키마 변경은 없다.

백엔드 저장소에서 이 패치를 적용한다:

```sh
git apply --check /path/to/report-location-only.patch
git apply /path/to/report-location-only.patch
ruff check .
DATABASE_URL=postgresql+asyncpg://chagok:chagok@localhost:5432/chagok_report_test pytest -q
```

테스트 DB에는 먼저 저장소 절차대로 마이그레이션을 적용해야 한다. 테스트는 테이블을 초기화하므로 반드시 별도의 `_test` DB를 사용한다.

검증: 로컬 ruff 및 Python 구문 검사 통과. pytest는 FastAPI 미설치로 수집 단계에서 중단. 테스트 DB/PostGIS 환경도 이 컴퓨터에 준비되어 있지 않다. 운영 배포 및 브라우저 검증은 미완료.

기존 제보로 이미 만들어진 주차 데이터는 이 수정으로 자동 삭제되지 않는다. 실제 주차 여부를 확인한 뒤 별도로 정리해야 한다.

## GitHub 반영 상태 (2026-10-14)

프론트엔드 PR #71은 main에 병합 완료 (a2dd0240c65176347f03c1922cfccf2946ff59ce). 백엔드는 로컬 수정 커밋 `59e604e`까지 준비했지만 GitHub 연결 도구 및 로컬 Git 계정 hyojaelee22의 쓰기 권한이 모두 403으로 거부되어 업로드·병합·배포하지 못했다.
