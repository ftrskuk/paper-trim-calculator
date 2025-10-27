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
