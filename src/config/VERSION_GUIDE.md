# 앱 버전 관리 가이드

## 📍 현재 버전 위치

### 1. 브라우저 저장소
- **localStorage**: `appVersion` 키로 저장
- **위치**: 각 사용자의 브라우저 로컬스토리지
- **용도**: 사용자별 버전 체크 및 강제 초기화

### 2. 코드 내 설정
- **파일**: `src/config/appVersion.ts`
- **용도**: 앱 내 모든 버전 관리

## 🔧 버전 관리 방법

### 현재 방법 (추천)
```typescript
// src/config/appVersion.ts
export const APP_VERSION = "1.1.0";
```

### 대안 방법들

#### 1. package.json 연동
```typescript
// src/config/appVersion.ts
import packageJson from '../../package.json';
export const APP_VERSION = packageJson.version;
```

#### 2. 환경변수 사용
```typescript
// .env.local
NEXT_PUBLIC_APP_VERSION=1.1.0

// src/config/appVersion.ts
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
```

## 📋 버전 변경 절차

### 1. 언제 버전을 변경해야 할까?
- ✅ localStorage 데이터 구조 변경
- ✅ 사용자 데이터 초기화 필요
- ✅ 중요한 기능 업데이트
- ✅ 추천 시스템 로직 변경
- ❌ 단순 UI 변경
- ❌ 스타일 수정

### 2. 버전 변경 방법
1. `src/config/appVersion.ts`에서 `APP_VERSION` 변경
2. `VERSION_HISTORY`에 변경사항 기록
3. 배포 후 모든 사용자 데이터 자동 초기화

### 3. 버전 네이밍 규칙
- **Major (X.0.0)**: 큰 변경사항, 데이터 구조 변경
- **Minor (X.Y.0)**: 새로운 기능 추가
- **Patch (X.Y.Z)**: 버그 수정, 소규모 개선

## 🔍 현재 상태 확인

### 개발자 도구에서 확인
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
localStorage.getItem('appVersion');
```

### 코드에서 확인
```typescript
import { APP_VERSION } from '@/config/appVersion';
console.log('현재 앱 버전:', APP_VERSION);
```

## 💡 팁

### 1. 버전 변경 시 주의사항
- 모든 사용자 데이터가 초기화됩니다
- 테스트 후 배포하세요
- 사용자에게 변경사항을 알려주세요

### 2. 디버깅
```typescript
// 강제 초기화 로그 확인
// 개발자 도구 콘솔에서 다음 메시지 확인
"앱 버전이 업데이트되었습니다 (undefined -> 1.1.0). 데이터를 초기화합니다."
```

### 3. 테스트 방법
```javascript
// 개발 시 로컬에서 테스트
localStorage.setItem('appVersion', '1.0.0'); // 구버전으로 설정
location.reload(); // 페이지 새로고침
// 콘솔에서 초기화 메시지 확인
```

## 🚀 향후 개선 방안

1. **자동 버전 체크**: 서버에서 최신 버전 확인
2. **점진적 업데이트**: 사용자 데이터 마이그레이션
3. **버전별 알림**: 사용자에게 변경사항 공지
4. **롤백 시스템**: 문제 발생 시 이전 버전으로 복구 