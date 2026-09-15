# Music Vault Database and Authentication

## Technology

Music Vault currently uses Supabase for PostgreSQL database hosting and user authentication.

## Authentication

Supabase Authentication manages:

- User email
- Password authentication
- User ID
- User sessions

Passwords are not stored in the public Music Vault profile table.

## Profile Schema

The Music Vault profile table contains:

| Column | Type | Constraints |
| --- | --- | --- |
| id | UUID | Primary Key, Foreign Key |
| username | TEXT | UNIQUE, NOT NULL |
| created_at | TIMESTAMPTZ | Default: now() |

The profile ID references the authenticated Supabase user:

`profiles.id -> auth.users.id`

## Row Level Security

Row Level Security (RLS) is enabled for user profile data.

The primary security condition is:

`auth.uid() = id`

Current/planned policies allow authenticated users to:

- Read their own profile
- Create their own profile
- Update their own profile

Users should not be able to access another user's profile.

## Sprint 1 Status

Completed:

- Supabase project configured
- Email/password authentication enabled
- Test authentication user created
- User profile schema created
- Profile ID connected to Supabase Auth user ID
- Username uniqueness and NOT NULL constraints configured
- RLS configuration started

Remaining:

- Verify SELECT and UPDATE RLS policies
- Connect React registration/login interface to Supabase
- Test automatic profile creation
- Test login and profile retrieval
- Complete end-to-end registration testing