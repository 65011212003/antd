# Supabase Integration

This project uses Supabase for authentication and database.

## Setup

1. Environment variables are configured in `.env.local`
2. The Supabase client is initialized in `lib/supabase.ts`

## Features

### Authentication
- ✅ Email/Password login
- ✅ Email/Password registration
- ✅ OAuth (Google, GitHub) - Requires additional setup in Supabase Dashboard
- ✅ Session management
- ✅ Email confirmation

### How to Enable OAuth Providers

1. Go to your Supabase Dashboard: https://upndznvhcxnttiaktoih.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Enable and configure:
   - **Google**: Add Client ID and Client Secret from Google Cloud Console
   - **GitHub**: Add Client ID and Client Secret from GitHub OAuth Apps

### Database Schema (Optional)

You can extend the authentication with custom user profiles:

```sql
-- Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, phone, country)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Security Notes

⚠️ **Important**: The `.env.local` file contains sensitive credentials and is excluded from Git.
- Never commit `.env.local` to version control
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Never expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code

## Usage

### Login
Navigate to `/login` to access the login page with:
- Email/Password authentication
- OAuth providers (if configured)

### Register
Navigate to `/register` to create a new account with:
- Multi-step registration form
- Password strength indicator
- Email verification

### Logout
Click the user avatar in the header and select "Logout"
