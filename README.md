# ACG Climbing Sessions

Website for Adaptive individuals to sign up for climbing sessions and see information for that day based off of a calendar.

## Features

- **Next.js 14+ App Router** with TypeScript
- **Tailwind CSS** for responsive styling
- **Supabase** for authentication and database
- **Google OAuth** login
- **Role-based access control** (lead, volunteer, climber)
- **Calendar view** using react-big-calendar
- **Protected Create Event form** (lead users only)
- **Lucide icons** for UI elements

## Tech Stack

- Next.js 14+
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- React Big Calendar
- Lucide React Icons
- date-fns

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('lead', 'volunteer', 'climber')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  capacity INTEGER,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Lead users can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'lead'
    )
  );

CREATE POLICY "Lead users can update their own events" ON events
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'lead'
    )
  );

CREATE POLICY "Lead users can delete their own events" ON events
  FOR DELETE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'lead'
    )
  );
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/0Boots/ACG-Site-Test.git
cd ACG-Site-Test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the database schema SQL from above
3. Enable Google OAuth in Authentication > Providers
4. Configure Google OAuth credentials

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

- **Lead**: Can create, edit, and delete events. Has full access to all features.
- **Volunteer**: Can view events and their own profile.
- **Climber**: Can view events and sign up for sessions (basic user).

## Project Structure

```
ACG-Site-Test/
├── app/
│   ├── auth/
│   │   └── callback/          # OAuth callback handler
│   ├── dashboard/             # Main dashboard with calendar
│   ├── events/
│   │   └── create/            # Create event form (lead only)
│   ├── login/                 # Login page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page (redirects to dashboard)
├── components/
│   └── Navigation.tsx         # Navigation component with role-based menu
├── lib/
│   └── supabase/              # Supabase client utilities
│       ├── client.ts          # Browser client
│       ├── server.ts          # Server client
│       └── middleware.ts      # Auth middleware
├── types/
│   └── database.ts            # TypeScript database types
├── middleware.ts              # Next.js middleware
└── package.json
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

See LICENSE file for details.
