### **신규 프로젝트 제품 요구사항 문서 (PRD)**

**1. 제품 개요 (Introduction & Vision)**

- **제품명:** 트림 사이즈 계산기 (Paper Trim Calculator)
- **비전:** 제지 생산 기획자가 복잡한 생산 주문을 처리할 때, 수동 계산의 오류를 줄이고 재료 손실을 최소화하며 생산 효율을 극대화할 수 있도록 돕는 지능형 웹 애플리케이션을 구축한다.
- **목표:**
    - 사용자(생산 기획자)가 웹 브라우저를 통해 언제 어디서든 접속하여 작업할 수 있는 SaaS(Software as a Service) 환경을 제공한다.
    - AI를 활용하여 수 분 내에 최적의 생산 세트 조합을 자동으로 생성하여 의사결정 시간을 단축시킨다.
    - 모든 계산 내역을 사용자의 계정에 안전하게 저장하여, 과거 데이터를 쉽게 조회하고 재활용할 수 있는 워크플로우를 만든다.
- **타겟 사용자:**
    - 제지 공장의 생산 관리자 및 스케줄러
    - 제지 유통사의 영업 및 발주 담당자
    - 대량의 지류를 취급하는 인쇄소 또는 가공업체의 구매 담당자

**2. 핵심 기능 및 요구사항 (Core Features & Functional Requirements)**

- **사용자 인증 (User Authentication):**
    - 사용자는 **Google 계정을 이용한 SSO(Single Sign-On)**를 통해 간편하고 안전하게 로그인할 수 있어야 한다.
    - 로그인하지 않은 사용자는 서비스의 핵심 기능(계산기, 기록 조회)에 접근할 수 없어야 한다.
    - 로그인 후에는 자신의 계정 정보 확인 및 로그아웃 기능이 제공되어야 한다.
- **동적 트림 사이즈 계산기 (Dynamic Trim Size Calculator):**
    - **기본 정보 입력:** 사용자는 제지사, 평량(g/m²), 롤 길이(m) 등 생산의 기본 조건을 설정할 수 있어야 한다. 선택된 제지사에 따라 적용 가능한 데클(Deckle) 범위가 자동으로 표시되어야 한다.
    - **발주 롤 입력:** 여러 종류의 지폭(mm)과 각 지폭별 필요 수량(톤)을 입력할 수 있는 동적인 테이블을 제공해야 한다. 사용자는 필요에 따라 이 테이블의 행(지폭 종류)을 추가하거나 삭제할 수 있어야 한다.
    - **세트 조합 구성:** 사용자가 생산할 세트(Set) 조합을 구성할 수 있는 동적인 테이블을 제공해야 한다. 각 세트는 여러 지폭 롤의 조합으로 구성되며, 사용자는 테이블의 열(세트 종류)을 추가하거나 삭제할 수 있어야 한다.
    - **실시간 계산 및 피드백:** 사용자가 수량을 입력할 때마다 각 세트의 '지폭합'과 '예상 생산 무게'가 실시간으로 계산되어야 한다. 지폭합이 데클 범위에 맞는지 여부를 시각적(예: 녹색/적색)으로 즉시 피드백해야 한다.
- **AI 기반 자동 최적화 (AI-Powered Optimization):**
    - 사용자가 입력한 '필요 롤' 정보를 바탕으로, **OpenAI의 GPT-4 API**를 호출하여 최적의 세트 조합을 자동으로 생성하는 기능을 제공해야 한다.
    - AI는 데클 범위를 준수하면서 필요 수량을 가장 효율적으로 충족시키는 여러 세트 조합과 각 세트의 승수(반복 생산 횟수)를 제안해야 한다.
    - "AI로 채우기" 버튼 클릭 시, AI가 생성한 결과를 계산기 테이블에 자동으로 채워 넣어 사용자가 즉시 확인할 수 있어야 한다.
- **계산 기록 관리 (Calculation History):**
    - 사용자는 현재 작업 중인 계산기 상태 전체(입력값, 세트 조합 등)를 자신의 계정에 **저장**할 수 있어야 한다.
    - 별도의 '기록' 페이지에서 자신이 저장한 모든 계산 내역 목록을 조회할 수 있어야 한다.
    - 기록 목록에서 특정 항목을 선택하면, 해당 데이터를 계산기로 다시 **불러와** 작업을 이어가거나 수정할 수 있어야 한다.
    - 저장된 기록의 이름을 변경하거나 삭제하는 관리 기능을 제공해야 한다.
- **데이터 내보내기 (Data Export):**
    - 최종 확정된 계산 결과를 **Excel(.xlsx)** 및 **PDF(.pdf)** 파일 형식으로 내보낼 수 있는 기능을 제공해야 한다.

**3. 기술 스택 및 아키텍처 (Technology Stack & Architecture)**

- **Frontend:** React, TypeScript
- **CSS Framework:** Tailwind CSS
- **Backend & Framework:** Next.js (API Routes 활용)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google SSO 연동)
- **AI Model API:** **OpenAI (GPT-4 API)**
- **Deployment:** Vercel

**4. 데이터베이스 스키마 (Database Schema - Supabase)**

- **calculations 테이블:**
    - id (uuid, Primary Key): 계산 내역의 고유 식별자.
    - user_id (uuid, Foreign Key): auth.users 테이블과 연결되어 데이터 소유자를 명시.
    - name (text): 사용자가 식별을 위해 지정한 계산의 이름.
    - created_at (timestamp): 데이터 생성 시각.
    - data (jsonb): 계산기의 모든 상태(기본 정보, 롤 목록, 세트 조합 등)를 저장하는 JSON 필드.

**5. 구현 계획 (High-Level Implementation Plan)**

### ✅ 완료된 단계 (Completed)

**✅ 1단계: 프로젝트 설정 및 인증 구현**
- Next.js 16, TypeScript, Tailwind CSS 4 기반 프로젝트 생성 완료
- Supabase 프로젝트 설정 및 calculations 테이블 스키마 정의 완료
- Supabase Auth를 통한 Google SSO 연동 완료 (로그인, 로그아웃, 세션 관리)
- Row Level Security (RLS) 정책 구현 완료

**✅ 2단계: 핵심 계산기 UI 및 기능 구축**
- 기본 정보 입력 UI (제지사, 평량, 롤 길이) 구현 완료
- 동적 롤 입력 테이블 (추가/삭제 가능) 구현 완료
- 동적 세트 조합 테이블 (추가/삭제 가능) 구현 완료
- 실시간 계산 로직 및 시각적 피드백 구현 완료

**✅ 3단계: AI 연동 및 백엔드 API 개발**
- Next.js API Route `/api/optimize` 구현 완료
- OpenAI Responses API (GPT-5-mini) 통합 완료
- "AI로 채우기" 버튼 연동 및 자동 데이터 채우기 기능 구현 완료
- 서버 사이드 API Key 관리 완료

**✅ 4단계: 기록 저장/불러오기 기능 구현**
- Supabase CRUD API 엔드포인트 (`/api/history`) 구현 완료
- 계산 데이터 저장, 조회, 수정, 삭제 기능 구현 완료
- 계산기 페이지의 저장 기능 구현 완료
- 기록 목록 조회 및 불러오기 기능 구현 완료
- 이름 변경 및 삭제 기능 구현 완료

**✅ 5단계: 최종 기능 및 배포**
- Excel(.xlsx) 및 PDF(.pdf) 내보내기 기능 구현 완료
- Vercel CI/CD 파이프라인 구축 완료
- 프로덕션 배포 완료 ([paper-trim-calculator.vercel.app](https://paper-trim-calculator.vercel.app))
- 환경 변수 설정 완료

### 📝 향후 개발 계획 (Future Roadmap)

**🎯 단기 개선 사항 (Short-term)**
- AI 프롬프트 엔지니어링 개선: GPT-5 모델의 JSON schema 출력 안정화 및 예측 가능성 향상
- 계산 기록 UI/UX 개선: 검색, 필터링, 정렬 기능 추가
- 로딩 상태 및 에러 처리 강화: 사용자 친화적인 피드백 메시지 추가
- 반응형 디자인 최적화: 모바일 기기 지원 강화

**🚀 중기 기능 추가 (Mid-term)**
- 계산 템플릿 기능: 자주 사용하는 설정을 템플릿으로 저장
- 데이터 시각화: Chart.js를 활용한 생산 효율 그래프 및 대시보드
- 배치 가져오기/내보내기: CSV 파일로 다중 계산 내역 일괄 처리
- 다국어 지원 (한국어, 영어, 일본어)

**🌟 장기 비전 (Long-term)**
- 사용자 간 계산 공유: 협업 기능 추가
- 고급 분석 기능: ML 기반 효율성 예측 및 최적화 제안
- API 제공: 외부 시스템 연동을 위한 RESTful API
- 통합 테스트: Playwright/Cypress 기반 E2E 테스트 스위트 구축

**📊 기술 부채 관리**
- TypeScript strict mode 적용
- 코드 재사용성 개선 (컴포넌트 추상화)
- 성능 최적화 (Code splitting, lazy loading)
- 접근성(A11y) 개선 (WCAG 2.1 AA 준수)