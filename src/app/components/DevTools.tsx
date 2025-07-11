'use client';

import { useEffect } from 'react';
import { registerDevTools } from '@/utils/versionUtils';

export default function DevTools() {
  useEffect(() => {
    // 개발 환경에서만 개발자 도구 등록
    if (process.env.NODE_ENV === 'development') {
      registerDevTools();
    }
  }, []);

  return null; // 이 컴포넌트는 아무것도 렌더링하지 않음
} 