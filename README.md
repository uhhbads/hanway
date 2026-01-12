# Hanway 漢way

A Mandarin Chinese learning app focused on **Traditional Chinese (Taiwan Mandarin)** with natural speech patterns and spaced repetition.

## ✨ Features

### 🔤 Translation with Pinyin
- English to Traditional Chinese translation
- Pinyin overlay with tone marks (e.g., nǐ hǎo)
- Character-by-character breakdown
- One-tap audio playback (Taiwan Mandarin TTS)

### 📚 Vocabulary Storage
- Save words directly from translations
- Offline-first with SQLite database
- Search and filter saved vocabulary
- Audio playback for pronunciation practice

### 🧠 SRS Practice
- Spaced Repetition System powered by **ts-fsrs**
- Duolingo-style recognition quizzes
- Stroke order animation via **Hanzi Writer**
- Track retention rate and review intervals

### 💬 Colloquial Alternatives
- Learn how native speakers actually talk
- See natural alternatives to textbook phrases
- Context-aware suggestions with usage notes
- Formality indicators (casual, neutral, formal)

### 🔐 Authentication (Jan 2026)
- **Guest Mode**: Use app without login, no friction
- **Email/Password**: Traditional sign up & sign in
- **OAuth**: Google and GitHub social login
- **Data Transfer**: Guest vocabulary auto-claimed on sign in
- **Supabase Auth**: Secure cloud-based authentication

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 54 + React Native |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Database | expo-sqlite |
| TTS | expo-speech (zh-TW) |
| Pinyin | pinyin-pro |
| SRS | ts-fsrs |
| Stroke Animation | Hanzi Writer (WebView) |
| Auth | Supabase + expo-auth-session |

## 📁 Folder Structure

```
hanway/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── auth/               # Authentication screens
│   │   ├── _layout.tsx     # Auth stack layout
│   │   ├── sign-in.tsx     # Sign in screen
│   │   ├── sign-up.tsx     # Sign up screen
│   │   └── callback.tsx    # OAuth callback handler
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tab bar config
│       ├── index.tsx       # Translate screen
│       ├── vocabulary.tsx  # Vocabulary list
│       ├── practice.tsx    # SRS practice
│       └── profile.tsx     # User stats & auth
├── src/
│   ├── constants/          # Colors, spacing, config
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication service & hooks
│   │   │   ├── auth.service.ts
│   │   │   ├── useAuth.ts
│   │   │   └── index.ts
│   │   ├── colloquial/     # Colloquial alternatives
│   │   ├── hanzi/          # Stroke order animation
│   │   ├── practice/       # SRS quiz & reviews
│   │   ├── translation/    # Translation service
│   │   └── vocabulary/     # Vocab management
│   ├── lib/                # Database & Supabase utilities
│   │   ├── database.ts     # SQLite operations
│   │   └── supabase.ts     # Supabase client & auth helpers
│   ├── store/              # Zustand state
│   └── types/              # TypeScript definitions
├── assets/                 # Images, fonts
├── app.json                # Expo config
├── babel.config.js         # Babel plugins
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.19.4
- Expo Go app on your phone
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hanway.git
cd hanway

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running on Device
1. Install **Expo Go** on your iOS or Android device
2. Scan the QR code from the terminal
3. The app will load on your device

## 📱 Screenshots

| Translate | Vocabulary | Practice | Profile |
|-----------|------------|----------|---------|
| 🔤 | 📚 | 🧠 | 👤 |

## 🎯 Roadmap

- [x] Real translation API integration (OpenAI)
- [x] User authentication (Supabase)
- [ ] Cloud sync with user accounts
- [ ] Handwriting recognition
- [ ] Sentence mining from content
- [ ] HSK/TOCFL level filtering
- [ ] Dark/Light theme toggle

## 🔧 Environment Variables

Create a `.env` file with:

```bash
# OpenAI (for translations & colloquial AI)
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key

# Supabase (for auth & future sync)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OAuth (optional, for Google/GitHub login)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for Mandarin learners
