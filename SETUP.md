# ACG Climbing Sessions - Setup Guide

This guide will walk you through setting up the ACG Climbing Sessions application.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Google OAuth credentials

## Step 1: Clone and Install

```bash
git clone https://github.com/0Boots/ACG-Site-Test.git
cd ACG-Site-Test
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Open the `supabase-schema.sql` file from this repository
3. Copy and paste the entire contents into the SQL Editor
4. Run the SQL script

This will create:
- `profiles` table with role-based access (lead, volunteer, climber)
- `events` table for climbing sessions
- Row Level Security policies
- Automatic profile creation trigger for new users

### Configure Google OAuth

1. In your Supabase project, go to Authentication > Providers
2. Enable the Google provider
3. You'll need to set up Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local development)
   - Copy the Client ID and Client Secret
4. Back in Supabase, enter the Google Client ID and Client Secret
5. Save the configuration

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings:
- Go to Settings > API
- Copy the Project URL and the `anon` `public` key

## Step 4: Assign User Roles

After a user signs in for the first time, they'll be assigned the default role of `climber`. To make a user a `lead` (who can create events):

1. Go to your Supabase project
2. Navigate to Table Editor > profiles
3. Find the user's profile
4. Change their `role` from `climber` to `lead`

## Step 5: Run the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Features

### Authentication
- Google OAuth sign-in
- Protected routes with middleware
- Automatic session management

### Role-Based Access Control
- **Lead**: Can create, edit, and delete events. Full access to all features.
- **Volunteer**: Can view events and manage their profile.
- **Climber**: Basic user, can view events and sign up for sessions.

### Pages

1. **Login Page** (`/login`)
   - Google OAuth sign-in button
   - Responsive design

2. **Dashboard** (`/dashboard`)
   - Interactive calendar view using react-big-calendar
   - Shows all climbing events
   - Multiple calendar views (month, week, day, agenda)
   - Real-time updates

3. **Create Event** (`/events/create`)
   - Protected route (lead users only)
   - Form to create new climbing events
   - Fields: title, description, start time, end time, location, capacity
   - Form validation

### Navigation
- Role-based navigation menu
- Shows different options based on user role
- "Create Event" button only visible to lead users
- Sign out functionality
- Lucide React icons throughout

## Project Structure

```
ACG-Site-Test/
├── app/                      # Next.js App Router
│   ├── auth/
│   │   └── callback/        # OAuth callback handler
│   ├── dashboard/           # Main dashboard with calendar
│   ├── events/
│   │   └── create/          # Create event form (lead only)
│   ├── login/               # Login page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirects to dashboard)
├── components/
│   └── Navigation.tsx       # Navigation with role-based menu
├── lib/
│   └── supabase/            # Supabase client utilities
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client
│       └── middleware.ts    # Auth middleware
├── types/
│   └── database.ts          # TypeScript database types
├── middleware.ts            # Next.js middleware
└── supabase-schema.sql      # Database schema
```

## Troubleshooting

### Cannot access dashboard after logging in
- Ensure your profile was created in the `profiles` table
- Check that the trigger is working correctly
- Manually insert a profile if needed

### Google OAuth not working
- Verify your redirect URIs are correct
- Check that the Google OAuth credentials are properly configured
- Ensure your Google project has the Google+ API enabled

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that Node.js version is 18 or higher: `node --version`
- Clear the build cache: `rm -rf .next && npm run build`

### Environment variables not working
- Ensure `.env.local` exists and has the correct values
- Restart the development server after changing environment variables
- Verify the variable names start with `NEXT_PUBLIC_` for client-side access

## Next Steps

After setup, you can:
1. Sign in with Google
2. Update your role to `lead` in the Supabase dashboard
3. Create climbing events
4. View events on the calendar
5. Customize the application to your needs

## Support

For issues or questions, please open an issue on GitHub.
