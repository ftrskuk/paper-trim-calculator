# Paper Trim Calculator 🌊

> AI-powered web application for paper mill production planning

**Live Demo:** [paper-trim-calculator.vercel.app](https://paper-trim-calculator.vercel.app)

Paper Trim Calculator helps production planners optimize paper mill trim configurations by calculating optimal set combinations that maximize deckle efficiency and minimize waste. Built for the paper manufacturing industry, this SaaS application leverages AI to generate production plans in seconds.

## ✨ Key Features

### 🎯 Core Functionality
- **Real-time Dynamic Calculator**: Configure mill settings (deckle range, substance, length) and build flexible production sets with instant width/weight validation
- **AI-Powered Optimization**: Automatically generates optimal set combinations using OpenAI GPT-5 API to meet deckle constraints and tonnage requirements
- **Production History Management**: Save, load, rename, and delete calculation histories with Supabase-backed persistence
- **One-Click Data Export**: Download calculation results as Excel (.xlsx) or PDF (.pdf) files

### 🔐 Authentication & Security
- **Google SSO Integration**: Secure single sign-on via Supabase Auth
- **User-specific Data**: All calculation histories are scoped to authenticated users with Row Level Security (RLS)

### 💡 Smart Features
- Real-time feedback on deckle range compliance (visual validation)
- Dynamic table management (add/remove rolls and sets on the fly)
- Intelligent set multiplier suggestions
- Production weight estimation with tonnage tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with Google OAuth 2.0
- **AI**: OpenAI Responses API (GPT-5-mini)
- **Export Libraries**: XLSX (Excel), jsPDF + jspdf-autotable (PDF)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and authentication)
- OpenAI API key (for AI optimization)
- Google Cloud Console OAuth credentials (for Google SSO)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ftrskuk/paper-trim-calculator.git
   cd paper-trim-calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase database:**
   
   - Go to your Supabase Dashboard → SQL Editor
   - Run the schema migration (see `docs/supabase-schema.sql` or create the `calculations` table with columns: `id`, `user_id`, `name`, `data` (jsonb), `created_at`, `updated_at`)
   - Enable Row Level Security (RLS) policies for authenticated users

5. **Run the development server:**
```bash
npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Production Deployment (Vercel)

The application is already deployed at [paper-trim-calculator.vercel.app](https://paper-trim-calculator.vercel.app)

For deploying your own instance:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Add redirect URLs to Supabase and Google Cloud Console
4. Deploy!

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── history/route.ts     # CRUD API for calculation history
│   │   ├── optimize/route.ts    # OpenAI integration endpoint
│   │   └── auth/route.ts        # Auth utilities
│   ├── auth/
│   │   └── callback/route.ts    # OAuth callback handler
│   ├── layout.tsx               # Root layout with Supabase provider
│   └── page.tsx                 # Main calculator UI
├── components/
│   ├── supabase-provider.tsx   # Supabase auth context provider
│   └── icons.tsx                # SVG icon components
├── constants/
│   └── mills.ts                 # Mill deckle configurations
├── hooks/
│   └── useAuth.ts               # Custom auth hook
├── lib/
│   └── supabaseClient.ts        # Browser Supabase client
├── services/
│   ├── supabase.ts              # Server-side Supabase clients
│   └── openai.ts                # OpenAI service wrapper
├── types/
│   └── index.ts                 # TypeScript type definitions
├── utils/
│   ├── auth-server.ts           # Server auth utilities
│   ├── calculations.ts          # Calculator logic
│   └── export.ts                # Excel/PDF export functions
└── globals.css                  # Global styles

docs/
└── PRD.md                       # Product Requirements Document
```

## ✅ Implemented Features

- ✅ Google OAuth SSO via Supabase Auth
- ✅ Dynamic calculator UI with real-time validation
- ✅ AI-powered set optimization using GPT-5-mini
- ✅ Calculation history (save, load, update, delete)
- ✅ Excel and PDF export functionality
- ✅ Row Level Security (RLS) for user data isolation
- ✅ Production deployment on Vercel
- ✅ TypeScript type safety
- ✅ Responsive Tailwind CSS design

## 🔜 Planned Improvements

- [ ] Enhanced AI prompt engineering for better optimization accuracy
- [ ] Add unit and E2E tests (Playwright/Cypress)
- [ ] Implement calculation templates/quick presets
- [ ] Add data visualization charts for production efficiency
- [ ] Multi-language support (Korean, English, Japanese)
- [ ] Batch import/export functionality
- [ ] Calculation sharing between users
- [ ] Advanced filtering and search for history

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

For questions or feedback, please open an issue on GitHub or contact the maintainers.

---

# Paper Trim Calculator 🌊 (한국어)

> 제지 생산 기획을 위한 AI 기반 웹 애플리케이션

**실시간 데모:** [paper-trim-calculator.vercel.app](https://paper-trim-calculator.vercel.app)

Paper Trim Calculator는 제지 공장 생산 기획자들이 데클(Deckle) 효율을 최대화하고 폐기물을 최소화하는 최적의 세트 조합을 계산하여 트림 구성을 최적화하는 데 도움을 주는 SaaS 애플리케이션입니다. AI를 활용하여 몇 초 내에 생산 계획을 생성합니다.

## ✨ 주요 기능

### 🎯 핵심 기능
- **실시간 동적 계산기**: 공장 설정(데클 범위, 평량, 길이)을 구성하고 즉각적인 폭/무게 검증을 통해 유연한 생산 세트를 구축합니다
- **AI 기반 최적화**: OpenAI GPT-5 API를 사용하여 데클 제약 조건과 톤 수 요구 사항을 충족하는 최적의 세트 조합을 자동으로 생성합니다
- **생산 기록 관리**: Supabase 기반 영구 저장을 통해 계산 기록을 저장, 불러오기, 이름 변경 및 삭제할 수 있습니다
- **원클릭 데이터 내보내기**: 계산 결과를 Excel(.xlsx) 또는 PDF(.pdf) 파일로 다운로드할 수 있습니다

### 🔐 인증 및 보안
- **Google SSO 통합**: Supabase Auth를 통한 안전한 단일 로그인
- **사용자별 데이터**: 모든 계산 기록은 Row Level Security(RLS)를 통해 인증된 사용자로 제한됩니다

### 💡 스마트 기능
- 데클 범위 준수에 대한 실시간 피드백 (시각적 검증)
- 동적 테이블 관리 (롤 및 세트를 즉시 추가/삭제)
- 지능형 세트 승수 제안
- 톤 수 추적이 포함된 생산 무게 추정

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 16 (App Router), React 19, TypeScript
- **스타일링**: Tailwind CSS 4
- **데이터베이스**: Supabase (Row Level Security가 포함된 PostgreSQL)
- **인증**: Google OAuth 2.0을 사용한 Supabase Auth
- **AI**: OpenAI Responses API (GPT-5-mini)
- **내보내기 라이브러리**: XLSX (Excel), jsPDF + jspdf-autotable (PDF)
- **배포**: Vercel

## 🚀 시작하기

### 필수 조건

- Node.js 18+ 및 npm
- Supabase 계정 (데이터베이스 및 인증용)
- OpenAI API 키 (AI 최적화용)
- Google Cloud Console OAuth 자격 증명 (Google SSO용)

### 로컬 개발 환경 설정

1. **저장소 복제:**
   ```bash
   git clone https://github.com/ftrskuk/paper-trim-calculator.git
   cd paper-trim-calculator
   ```

2. **의존성 설치:**
   ```bash
   npm install
   ```

3. **환경 변수 설정:**
   
   루트 디렉터리에 `.env.local` 파일을 만들고 다음 변수를 추가합니다:
   ```bash
   # Supabase 구성
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI 구성
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Supabase 데이터베이스 설정:**
   
   - Supabase Dashboard → SQL Editor로 이동
   - 스키마 마이그레이션 실행 (`docs/supabase-schema.sql` 참조 또는 `id`, `user_id`, `name`, `data` (jsonb), `created_at`, `updated_at` 열이 포함된 `calculations` 테이블 생성)
   - 인증된 사용자를 위한 Row Level Security(RLS) 정책 활성화

5. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

6. **브라우저에서 [http://localhost:3000](http://localhost:3000) 열기**

### 프로덕션 배포 (Vercel)

애플리케이션은 [paper-trim-calculator.vercel.app](https://paper-trim-calculator.vercel.app)에 이미 배포되어 있습니다

자체 인스턴스를 배포하려면:

1. GitHub 저장소를 Vercel에 연결
2. Vercel 대시보드에서 환경 변수 구성
3. Supabase 및 Google Cloud Console에 리디렉션 URL 추가
4. 배포!

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── history/route.ts     # 계산 기록 CRUD API
│   │   ├── optimize/route.ts    # OpenAI 통합 엔드포인트
│   │   └── auth/route.ts        # 인증 유틸리티
│   ├── auth/
│   │   └── callback/route.ts    # OAuth 콜백 핸들러
│   ├── layout.tsx               # Supabase Provider가 포함된 루트 레이아웃
│   └── page.tsx                 # 메인 계산기 UI
├── components/
│   ├── supabase-provider.tsx   # Supabase 인증 컨텍스트 Provider
│   └── icons.tsx                # SVG 아이콘 컴포넌트
├── constants/
│   └── mills.ts                 # 공장 데클 구성
├── hooks/
│   └── useAuth.ts               # 커스텀 인증 훅
├── lib/
│   └── supabaseClient.ts        # 브라우저 Supabase 클라이언트
├── services/
│   ├── supabase.ts              # 서버 사이드 Supabase 클라이언트
│   └── openai.ts                # OpenAI 서비스 래퍼
├── types/
│   └── index.ts                 # TypeScript 타입 정의
├── utils/
│   ├── auth-server.ts           # 서버 인증 유틸리티
│   ├── calculations.ts          # 계산기 로직
│   └── export.ts                # Excel/PDF 내보내기 함수
└── globals.css                  # 글로벌 스타일

docs/
└── PRD.md                       # 제품 요구사항 문서
```

## ✅ 구현된 기능

- ✅ Supabase Auth를 통한 Google OAuth SSO
- ✅ 실시간 검증을 포함한 동적 계산기 UI
- ✅ GPT-5-mini를 사용한 AI 기반 세트 최적화
- ✅ 계산 기록 (저장, 불러오기, 업데이트, 삭제)
- ✅ Excel 및 PDF 내보내기 기능
- ✅ 사용자 데이터 격리를 위한 Row Level Security (RLS)
- ✅ Vercel에서 프로덕션 배포
- ✅ TypeScript 타입 안전성
- ✅ 반응형 Tailwind CSS 디자인

## 🔜 계획된 개선 사항

- [ ] 더 나은 최적화 정확도를 위한 AI 프롬프트 엔지니어링 향상
- [ ] 유닛 및 E2E 테스트 추가 (Playwright/Cypress)
- [ ] 계산 템플릿/빠른 사전 설정 구현
- [ ] 생산 효율성에 대한 데이터 시각화 차트 추가
- [ ] 다국어 지원 (한국어, 영어, 일본어)
- [ ] 배치 가져오기/내보내기 기능
- [ ] 사용자 간 계산 공유
- [ ] 기록에 대한 고급 필터링 및 검색

## 🤝 기여하기

기여를 환영합니다! 기여 가이드를 읽고 pull request를 제출해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다.

## 📞 문의

질문이나 피드백이 있으시면 GitHub에서 이슈를 열거나 관리자에게 연락하세요.
