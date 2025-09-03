# Authentication & User — Rafiatou

## Purpose & User Value

The Authentication & User module handles user registration, login, profile management, and account security. It provides secure access control, password management, OTP verification, and user preferences like theme settings. Users can create accounts, verify their email, manage their profiles, and maintain secure sessions across the platform.

## Current Frontend Flow

### Main routes/components involved:
- **Authentication Pages**: `src/modules/auth/components/LoginForm.tsx`, `src/modules/auth/components/SignupForm.tsx`, `src/modules/auth/components/OTPVerification.tsx`
- **User Context**: `src/contexts/AuthContext.tsx` - manages authentication state, tokens, and user data
- **Profile Management**: `src/modules/dashboard/components/ProfileSettings.tsx` (implied from dashboard structure)
- **Theme Management**: `src/components/ThemeProvider.tsx`, `src/components/LanguageToggle.tsx`

### State management and key hooks:
- `useAuth()` hook provides authentication state, login/logout functions, and user data
- JWT tokens stored in localStorage for persistence
- Theme preferences managed through `ThemeProvider` context
- Language preferences via `LanguageContext`

### How the UI calls services/handlers:
- Login/signup forms submit to `/api/v1/auth/login` and `/api/v1/auth/register`
- OTP verification calls `/api/v1/auth/verify-otp` and `/api/v1/auth/resend-otp`
- Profile updates use `/api/v1/auth/profile` (PUT)
- Theme preferences use `/api/v1/auth/theme-preferences` (PUT/GET)

## Current Backend/API Flow

### Handlers/routes involved:
- **Auth Routes**: `src/routes/v1/auth.routes.ts` - comprehensive auth endpoints
- **Auth Controller**: `src/modules/auth/auth.controller.ts` - handles all auth operations
- **Auth Service**: `src/modules/auth/auth.service.ts` - business logic and database operations
- **User Controller**: `src/modules/user/user.controller.ts` - profile management
- **User Service**: `src/modules/user/user.service.ts` - user data operations

### Auth/ownership checks expected:
- JWT token validation via `authMiddleware` for protected routes
- User ownership verification for profile updates and account deletion
- Password verification for sensitive operations (password change, account deletion)
- OTP validation for email verification and password reset

### DB collections/documents touched:
- **users** collection - stores user profiles, passwords, OTP data, theme preferences
- **refreshTokens** - managed within user documents for session management

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/auth/register` | POST | None | User registration | Implemented | Includes theme preferences |
| `/auth/login` | POST | None | User login | Implemented | Returns access/refresh tokens |
| `/auth/google/callback` | GET | None | Google OAuth callback | Implemented | OAuth integration |
| `/auth/refresh-token` | POST | None | Token refresh | Implemented | Uses refresh token |
| `/auth/forgot-password` | POST | None | Password reset request | Implemented | Sends reset email |
| `/auth/reset-password` | POST | None | Password reset completion | Implemented | Uses reset token |
| `/auth/verify-otp` | POST | None | Email OTP verification | Implemented | 7-digit OTP |
| `/auth/resend-otp` | POST | None | Resend verification OTP | Implemented | Rate limited |
| `/auth/logout` | POST | Required | Single session logout | Implemented | Invalidates refresh token |
| `/auth/logout-all` | POST | Required | All sessions logout | Implemented | Clears all refresh tokens |
| `/auth/change-password` | POST | Required | Change user password | Implemented | Requires current password |
| `/auth/profile` | GET | Required | Get user profile | Implemented | Returns user data |
| `/auth/profile` | PUT | Required | Update user profile | Implemented | Validates ownership |
| `/auth/account` | DELETE | Required | Delete user account | Implemented | Requires password confirmation |
| `/auth/theme-preferences` | GET | Required | Get theme settings | Implemented | Returns theme config |
| `/auth/theme-preferences` | PUT | Required | Update theme settings | Implemented | Supports custom themes |
| `/user/profile/me` | GET | Required | Get current user profile | Implemented | Alternative profile endpoint |
| `/user/profile` | PUT | Required | Update user profile | Implemented | Extended profile fields |
| `/user/:userId/follow` | POST | Required | Follow user | Implemented | Social features |
| `/user/:userId/follow` | DELETE | Required | Unfollow user | Implemented | Social features |
| `/user/search` | GET | Optional | Search users | Implemented | Public search |

## Stories & Status

### Story: Update user's password
- **Status**: Implemented
- **Current behavior**: Users can change password via `/auth/change-password` endpoint. Requires current password verification, validates new password strength, and updates the hashed password in database.
- **Acceptance criteria**: ✅ User must provide current password, new password meets strength requirements, password is securely hashed and stored

### Story: Edit profile information
- **Status**: Implemented
- **Current behavior**: Users can update profile via `/auth/profile` (PUT) or `/user/profile` (PUT). Supports username, email, bio, country, avatar, and social links. Validates ownership and uniqueness constraints.
- **Acceptance criteria**: ✅ Profile updates are validated, ownership is verified, changes are persisted to database

### Story: Delete account
- **Status**: Implemented
- **Current behavior**: Users can delete account via `/auth/account` (DELETE). Requires password confirmation, removes user data, and invalidates all sessions.
- **Acceptance criteria**: ✅ Password confirmation required, user data is properly removed, all sessions invalidated

### Story: OTP (send email)
- **Status**: Implemented
- **Current behavior**: OTP emails sent via `/auth/resend-otp` endpoint. Generates 7-digit OTP, stores with expiration, and sends formatted email using EmailService.
- **Acceptance criteria**: ✅ OTP generated and stored, email sent with proper formatting, rate limiting applied

### Story: OTP (validation)
- **Status**: Implemented
- **Current behavior**: OTP verification via `/auth/verify-otp` endpoint. Validates 7-digit OTP against stored value and expiration time.
- **Acceptance criteria**: ✅ OTP format validated, expiration checked, verification status updated

### Story: OTP (sign-in)
- **Status**: Implemented
- **Current behavior**: OTP verification integrated into login flow. When email is not verified, user is redirected to OTP verification page with stored email.
- **Acceptance criteria**: ✅ Unverified users redirected to OTP page, email stored for verification, successful verification completes login

### Story: OTP (paid-plan integration)
- **Status**: Pending
- **How it should work**: OTP verification should be required for users upgrading to paid plans or accessing premium features. The system should verify user identity before processing payments or granting premium access.
- **Acceptance criteria**: 
  - OTP required before payment processing
  - Premium features locked until OTP verified
  - Clear messaging about verification requirement

### Story: OTP (forgot password)
- **Status**: Implemented
- **Current behavior**: Password reset flow uses OTP via `/auth/forgot-password` and `/auth/reset-password`. Generates reset token, sends email, and allows password reset with token validation.
- **Acceptance criteria**: ✅ Reset token generated, email sent, token validated, password updated

### Story: OTP (general OTP)
- **Status**: Implemented
- **Current behavior**: General OTP system implemented with 7-digit codes, expiration handling, and email delivery infrastructure.
- **Acceptance criteria**: ✅ OTP generation, storage, validation, and delivery working

### Story: Signup
- **Status**: Implemented
- **Current behavior**: User registration via `/auth/register` endpoint. Validates email uniqueness, password strength, generates username, and creates user account with email verification requirement.
- **Acceptance criteria**: ✅ Email validation, password requirements, username generation, account creation

### Story: Signin
- **Status**: Implemented
- **Current behavior**: User login via `/auth/login` endpoint. Validates credentials, returns JWT tokens, handles unverified email flow, and manages session state.
- **Acceptance criteria**: ✅ Credential validation, token generation, session management, unverified email handling

### Story: Logout
- **Status**: Implemented
- **Current behavior**: Single session logout via `/auth/logout` endpoint. Invalidates specific refresh token and clears client-side authentication state.
- **Acceptance criteria**: ✅ Token invalidation, client state cleared, session ended

### Story: Logout session
- **Status**: Implemented
- **Current behavior**: All sessions logout via `/auth/logout-all` endpoint. Clears all refresh tokens for the user and invalidates all active sessions.
- **Acceptance criteria**: ✅ All tokens invalidated, all sessions ended, security maintained

### Story: Google Authentication
- **Status**: Implemented
- **Current behavior**: Google OAuth integration via `/auth/google/callback` endpoint. Handles OAuth flow, creates or links accounts, and manages Google user data.
- **Acceptance criteria**: ✅ OAuth flow working, account creation/linking, user data management

### Story: Limit character passwords
- **Status**: Implemented
- **Current behavior**: Password validation includes length requirements and character restrictions. Enforced in registration, password change, and reset flows.
- **Acceptance criteria**: ✅ Password length validation, character requirements, consistent enforcement

### Story: Add beat to cart
- **Status**: Pending
- **How it should work**: Users should be able to add beats to a shopping cart for purchase. The cart should persist across sessions and allow quantity management, price calculation, and checkout preparation.
- **Acceptance criteria**: 
  - Beats can be added to cart with license selection
  - Cart persists across browser sessions
  - Price calculation includes license costs
  - Cart items can be removed or quantities updated

### Story: Reminder Email
- **Status**: Pending
- **How it should work**: System should send reminder emails for various user actions like incomplete profile setup, unverified accounts, or abandoned carts. Emails should be scheduled and personalized.
- **Acceptance criteria**: 
  - Email scheduling system implemented
  - Personalized reminder content
  - Configurable reminder intervals
  - User can opt-out of reminders

### Story: Beat Like Notifications
- **Status**: Pending
- **How it should work**: When a user's beat receives a like, the beat owner should receive an email notification with details about the like, including the liker's information and beat details. This should be configurable in user preferences.
- **Acceptance criteria**: 
  - Email sent to beat owner when beat is liked
  - Notification includes liker's username and beat title
  - User can enable/disable like notifications in preferences
  - Email template is branded and professional

### Story: New Follower Notifications
- **Status**: Pending
- **How it should work**: When a user gains a new follower, they should receive an email notification with the follower's profile information and a link to view their profile. This helps users stay engaged with their growing audience.
- **Acceptance criteria**: 
  - Email sent to user when they gain a new follower
  - Notification includes follower's username and profile link
  - User can enable/disable follower notifications in preferences
  - Email includes call-to-action to view follower's profile

### Story: Sales Notifications
- **Status**: Pending
- **How it should work**: When a user's beat is purchased, they should receive an email notification with sale details including buyer information, beat title, license type, and earnings. This is crucial for revenue tracking and user engagement.
- **Acceptance criteria**: 
  - Email sent to beat owner when beat is sold
  - Notification includes buyer info, beat details, license type, and earnings
  - User can enable/disable sales notifications in preferences
  - Email includes earnings breakdown and payment information

### Story: Switch theme
- **Status**: Implemented
- **Current behavior**: Theme switching via `/auth/theme-preferences` endpoint. Supports light/dark/system modes and custom theme colors. Theme state managed through ThemeProvider context.
- **Acceptance criteria**: ✅ Theme switching working, preferences persisted, custom themes supported

## Data & Validation

### Required inputs and constraints:
- **Email**: Valid email format, unique across system, required for registration
- **Username**: 3-30 characters, alphanumeric + underscore, unique across system
- **Password**: Minimum length requirements, character restrictions, required for sensitive operations
- **OTP**: 7-digit numeric code, expires after set time period
- **Profile fields**: Bio (500 chars max), country (50 chars max), social links (validated URLs)
- **Notification preferences**: Email notification settings for likes, follows, sales, and reminders

### Key error cases the UI must handle:
- **Authentication failed**: Invalid credentials, expired tokens, account locked
- **Validation errors**: Invalid email format, weak passwords, duplicate usernames
- **OTP errors**: Invalid code, expired code, rate limiting exceeded
- **Network errors**: Connection failures, server errors, timeout handling
- **Permission errors**: Unauthorized access, insufficient privileges
- **Email delivery errors**: SMTP failures, invalid email addresses, bounce handling
- **Notification errors**: Failed notification delivery, preference validation errors

## Open Risks / Decisions

- **OTP rate limiting**: Current implementation may need enhanced rate limiting for production
- **Password reset security**: Consider additional security measures for password reset flow
- **Google OAuth scope**: May need to expand OAuth permissions for additional user data
- **Session management**: Consider implementing session timeout and concurrent session limits
- **Email deliverability**: Monitor email delivery rates and implement fallback mechanisms
- **Theme persistence**: Ensure theme preferences sync across devices
- **SMTP configuration**: Need robust SMTP setup for reliable email delivery
- **Notification preferences**: User notification settings need to be easily configurable
- **Email templates**: Professional email templates needed for all notification types
- **Email queue system**: Consider implementing email queue for high-volume notifications
- **Bounce handling**: Need to handle email bounces and invalid addresses gracefully

## Test Scenarios

- **Happy path registration**: Valid email, strong password, successful account creation and email verification
- **Login with unverified email**: User attempts login before email verification, redirected to OTP page
- **Password change flow**: User changes password with current password verification
- **Profile update**: User updates profile information with validation and ownership checks
- **Account deletion**: User deletes account with password confirmation and data cleanup
- **Theme switching**: User switches between light/dark/system themes with persistence
- **Google OAuth flow**: Complete Google authentication flow with account creation/linking
- **OTP verification**: OTP generation, email delivery, and verification with expiration handling
- **Session management**: Login, logout, and refresh token handling across multiple sessions
- **Error handling**: Invalid credentials, expired tokens, network failures, and validation errors
- **Beat like notifications**: User receives email when their beat is liked, notification preferences respected
- **Follower notifications**: User receives email when they gain a new follower, includes follower details
- **Sales notifications**: User receives email when their beat is sold, includes sale details and earnings
- **Notification preferences**: User can enable/disable different notification types, settings persist
- **Email delivery**: SMTP emails delivered successfully, bounce handling works correctly
- **Email templates**: All notification emails use professional templates with proper branding
