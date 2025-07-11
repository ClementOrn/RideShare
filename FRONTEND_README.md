# Frontend Setup - Private Rideshare Platform

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Frontend (Port 1311)

```bash
npm run frontend
```

Or:

```bash
npm run dev
```

Visit: **http://localhost:1311**

## 📦 Current Setup

✅ **Framework**: Next.js 14 with App Router  
✅ **Language**: TypeScript  
✅ **Styling**: Tailwind CSS  
✅ **Port**: 1311  
✅ **Contract**: 0x5986FF19B524534F159af67f421ca081c6F5Acff

## 📁 Frontend Structure

```
dapp131/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page (Port 1311)
│   └── globals.css      # Global styles
├── next.config.js       # Next.js config
├── tailwind.config.ts   # Tailwind config
├── tsconfig.json        # TypeScript config
└── package.json         # Scripts
```

## 🎨 Features

- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript type safety
- ✅ Fast refresh development
- ✅ Production build ready

## 📝 Available Scripts

```bash
npm run dev        # Start dev server on port 1311
npm run frontend   # Same as npm run dev
npm run build      # Build for production
npm run start      # Start production server (port 1311)
npm run lint       # Run ESLint
```

## 🔧 Next Steps

1. Install dependencies: `npm install`
2. Run frontend: `npm run frontend`
3. Visit: http://localhost:1311
4. Add Web3 features (Wagmi + RainbowKit)
5. Build production: `npm run build`

## 🌐 Port Configuration

Frontend runs on **Port 1311** as configured in package.json:

```json
{
  "scripts": {
    "dev": "next dev -p 1311",
    "start": "next start -p 1311",
    "frontend": "next dev -p 1311"
  }
}
```

## ✨ Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React 18
- PostCSS
- Autoprefixer

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Frontend ready on port 1311!** 🎉
