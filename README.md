# Brain - Personal Knowledge Management System

A modern, full-stack knowledge management application built with Next.js 15, React 19, TypeScript, and Supabase.

## Features

- **📝 Notes Management** - Create, edit, and organize notes with rich text editing
- **✅ Task Tracking** - Manage tasks with priorities, status, and due dates
- **📚 Knowledge Base** - Store and organize articles and documentation
- **📔 Journal Entries** - Daily reflections with mood tracking
- **🔍 Real-time Search** - Quick search across all your content
- **🏷️ Categories & Tags** - Organize content with categories and tags
- **☁️ Cloud Sync** - All data automatically synced with Supabase

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Rich Text**: TipTap Editor with syntax highlighting
- **Markdown**: Marked with highlight.js
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd brain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Run the database schema:
      - Go to SQL Editor in your Supabase dashboard
      - Copy the contents of `supabase-schema.sql`
      - Paste and execute

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## Project Structure

```
brain/
├── app/                    # Next.js app router pages
│   ├── calendar/          # Calendar view
│   ├── dashboard/         # Main dashboard
│   ├── journal/           # Journal entries
│   ├── knowledge/         # Knowledge base
│   ├── notes/             # Notes management
│   ├── search/            # Global search
│   ├── settings/          # App settings
│   └── tasks/             # Task management
├── components/            # Reusable React components
├── lib/                   # Utilities and hooks
│   ├── hooks/            # Custom React hooks
│   └── supabase.ts       # Supabase client setup
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Database Schema

The application uses four main tables:

- `notes` - User notes with categories and tags
- `tasks` - Task management with priorities and status
- `knowledge_articles` - Knowledge base articles
- `journal_entries` - Daily journal entries with mood tracking

See `supabase-schema.sql` for the complete schema.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## Security

- Environment variables are properly configured
- Supabase Row Level Security (RLS) enabled
- API keys are stored securely
- All database operations go through Supabase client

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue in the GitHub repository.
