# Paradigm Pro iOS App — Implementation Plan

## Overview

Build a native iOS app (SwiftUI) for the Paradigm Pro 12-week course platform. The app targets **students** as the primary audience, consuming the existing Next.js REST API. Admin/instructor features remain web-only initially.

---

## Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **UI** | SwiftUI | Modern, declarative, Apple-recommended |
| **Min Target** | iOS 16+ | Covers 95%+ of active devices |
| **Networking** | URLSession + async/await | Native, no dependencies needed |
| **Auth** | Keychain (token storage) | Secure credential/token persistence |
| **Video** | AVKit / AVPlayer | Native video playback with full controls |
| **State** | @Observable (Observation framework) | Clean state management for iOS 17+; fallback to ObservableObject for iOS 16 |
| **Navigation** | NavigationStack | Type-safe, programmatic navigation |
| **Offline** | SwiftData or Core Data | Cache courses, progress, and materials |
| **File Downloads** | URLSession download tasks | Background download support for materials |
| **Package Manager** | Swift Package Manager | Standard, no CocoaPods/Carthage needed |

### Project Structure

```
ParadigmPro/
├── ParadigmProApp.swift              # App entry point
├── Info.plist
├── Assets.xcassets/
├── Models/
│   ├── User.swift                    # User, Role enum
│   ├── Course.swift                  # Course, Week, Lesson, Material
│   ├── Enrollment.swift
│   └── Progress.swift
├── Services/
│   ├── APIClient.swift               # Base HTTP client (auth headers, error handling)
│   ├── AuthService.swift             # Login, register, token management
│   ├── CourseService.swift           # Fetch courses, course details
│   ├── EnrollmentService.swift       # Enroll/unenroll
│   ├── ProgressService.swift         # Track lesson completion, video progress
│   └── KeychainManager.swift         # Secure token storage
├── ViewModels/
│   ├── AuthViewModel.swift           # Login/register state
│   ├── CoursesViewModel.swift        # Course list + enrollment state
│   ├── CourseDetailViewModel.swift   # Single course with weeks/lessons
│   ├── LessonViewModel.swift         # Lesson content + video progress
│   └── ProfileViewModel.swift        # User profile + stats
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   ├── RegisterView.swift
│   │   └── AuthContainerView.swift
│   ├── Courses/
│   │   ├── CourseListView.swift      # My Courses + Available Courses tabs
│   │   ├── CourseCardView.swift      # Course thumbnail card
│   │   └── CourseDetailView.swift    # Week list with progress
│   ├── Lessons/
│   │   ├── WeekView.swift            # Lesson list for a week
│   │   ├── LessonView.swift          # Video player + content + materials
│   │   ├── VideoPlayerView.swift     # AVKit wrapper with progress tracking
│   │   └── MaterialRowView.swift     # Downloadable material row
│   ├── Profile/
│   │   └── ProfileView.swift         # User info, enrolled courses, logout
│   └── Components/
│       ├── ProgressRing.swift        # Circular progress indicator
│       ├── LoadingView.swift
│       └── ErrorView.swift
├── Navigation/
│   └── MainTabView.swift             # Tab bar (Courses, Profile)
├── Utilities/
│   ├── Constants.swift               # API base URL, keys
│   └── Extensions.swift              # Date, String, Color extensions
└── Preview Content/
    └── PreviewData.swift             # Mock data for SwiftUI previews
```

---

## Screens & User Flows

### 1. Authentication Flow
- **Login Screen** — Email + password fields, "Login" button, link to register
- **Register Screen** — Name, email, password, confirm password, "Create Account" button
- Token stored in Keychain after successful auth
- Auto-login on app launch if valid token exists

### 2. Main Tab Bar
- **Tab 1: Courses** — Course catalog and enrolled courses
- **Tab 2: Profile** — User info, stats, settings, logout

### 3. Courses Tab
- **Segmented control**: "My Courses" / "Available"
- **My Courses**: Grid of enrolled course cards showing title, thumbnail, progress %
- **Available**: Grid of unenrolled published courses with "Enroll" button
- Pull-to-refresh

### 4. Course Detail Screen
- Course title, description, overall progress bar
- List of 12 weeks, each showing:
  - Week number + title
  - Lesson count + completed count
  - Expansion to show individual lessons
  - Week-level downloadable materials

### 5. Lesson Screen
- **Video lessons**: Full AVPlayer with:
  - Play/pause, seek, fullscreen
  - Auto-save progress every 5 seconds (matching web behavior)
  - Auto-mark complete at 90%
  - Resume from last position
- **Reading lessons**: Rendered markdown content
- **Assignment lessons**: Assignment description + content
- Downloadable materials list
- "Mark Complete" / "Mark Incomplete" toggle button

### 6. Profile Screen
- User name, email, role badge
- Total enrolled courses count
- Overall completion statistics
- Logout button

---

## API Integration

### Base Configuration
```
Base URL: {configurable} (e.g., https://paradigmpro.com/api)
Auth: Bearer token in Authorization header (JWT from NextAuth)
Content-Type: application/json
```

### Endpoints to Consume

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/api/auth/callback/credentials` |
| Register | POST | `/api/auth/register` |
| Get Session | GET | `/api/auth/session` |
| List Courses | GET | `/api/courses` |
| Course Detail | GET | `/api/courses/{courseId}` |
| Enroll | POST | `/api/enrollments` |
| Unenroll | DELETE | `/api/enrollments` |
| Update Progress | POST | `/api/progress` |

### API Client Requirements
- Automatic token refresh handling
- Retry logic with exponential backoff for network failures
- Proper error mapping to user-friendly messages
- Request/response logging in debug builds

### Auth Consideration
The current backend uses NextAuth.js with cookie-based JWT sessions, which is web-centric. For the iOS app, we need one of:

**Option A (Recommended): Add a dedicated mobile auth endpoint**
- Add `POST /api/auth/mobile/login` that returns a JWT token directly
- Add `POST /api/auth/mobile/refresh` for token refresh
- iOS app sends token via `Authorization: Bearer <token>` header
- Requires a small backend change (~2 new API routes)

**Option B: Use NextAuth CSRF + cookie flow**
- Mimic browser behavior (fetch CSRF token, submit credentials, capture session cookie)
- More fragile, not recommended for native apps

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create Xcode project with SwiftUI
- [ ] Set up project structure (folders, groups)
- [ ] Implement `APIClient` with async/await networking
- [ ] Implement `KeychainManager` for secure token storage
- [ ] Build data models matching Prisma schema
- [ ] **Backend**: Add mobile auth endpoints (`/api/auth/mobile/login`, `/api/auth/mobile/refresh`)
- [ ] Build Login & Register screens
- [ ] Implement auth state management (auto-login, logout)

### Phase 2: Course Browsing & Enrollment (Week 2)
- [ ] Build `CourseListView` with segmented tabs
- [ ] Build `CourseCardView` with thumbnail, title, progress
- [ ] Implement `CourseService` to fetch course list
- [ ] Build `CourseDetailView` with 12-week structure
- [ ] Implement enrollment/unenrollment
- [ ] Add pull-to-refresh and loading states
- [ ] Add empty states for no courses

### Phase 3: Lesson Viewing & Video (Week 3)
- [ ] Build `WeekView` with expandable lesson list
- [ ] Build `LessonView` with content type switching
- [ ] Implement `VideoPlayerView` with AVKit
  - Play/pause, seek bar, fullscreen
  - Progress tracking (auto-save every 5s)
  - Resume from last position
  - Auto-complete at 90%
- [ ] Render markdown content for reading lessons
- [ ] Build material download rows with share sheet
- [ ] Implement "Mark Complete" button

### Phase 4: Progress & Offline (Week 4)
- [ ] Implement progress syncing (batch updates when coming online)
- [ ] Cache course data for offline browsing (SwiftData)
- [ ] Background download support for materials
- [ ] Profile screen with stats
- [ ] Error handling & edge cases polish

### Phase 5: Polish & Release (Week 5)
- [ ] App icon and launch screen
- [ ] Haptic feedback on key actions
- [ ] Accessibility (VoiceOver, Dynamic Type)
- [ ] Dark mode support
- [ ] App Store screenshots and metadata
- [ ] TestFlight beta distribution
- [ ] Performance optimization (image caching, lazy loading)

---

## Backend Changes Required

### New API Routes (for mobile auth)

**`POST /api/auth/mobile/login`**
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response (200)
{ "token": "jwt...", "refreshToken": "...", "user": { "id", "name", "email", "role" } }

// Response (401)
{ "error": "Invalid credentials" }
```

**`POST /api/auth/mobile/refresh`**
```json
// Request
{ "refreshToken": "..." }

// Response (200)
{ "token": "new-jwt...", "refreshToken": "new-refresh..." }
```

**Middleware update**: Accept `Authorization: Bearer <token>` header in addition to NextAuth session cookies for all protected API routes.

### Optional Backend Enhancements
- Add pagination to course list endpoint (`?page=1&limit=20`)
- Add `GET /api/users/me/stats` for profile statistics
- Add `GET /api/users/me/enrollments` for enrolled courses with progress
- Optimize course detail response to include user's progress data in one call

---

## Key Technical Decisions

1. **SwiftUI over UIKit** — Faster development, less boilerplate, modern Apple direction
2. **No third-party dependencies initially** — URLSession, AVKit, and Keychain APIs cover all needs; add libraries only if justified later
3. **Student-only scope** — Admin features stay on web; keeps iOS app focused and simpler
4. **Offline-first for viewed content** — Cache previously loaded courses and progress; sync when online
5. **Background video downloads not in v1** — Stream-only initially; download for offline viewing is a future feature
6. **iOS 16+ minimum** — Balances modern APIs with device coverage

---

## Testing Strategy

- **Unit Tests**: ViewModels, Services, API client, model parsing
- **UI Tests**: Auth flow, course browsing, video playback, enrollment
- **Preview Data**: Mock data for all SwiftUI previews to enable fast iteration
- **TestFlight**: Beta testing before App Store submission

---

## Future Enhancements (Post-v1)

- Push notifications (new course published, weekly reminders)
- Offline video downloads
- Picture-in-Picture video playback
- iPad multi-column layout
- Widgets (course progress, next lesson)
- Admin features (course management from iPad)
- Apple Sign In
- Certificate/completion PDF generation and sharing
