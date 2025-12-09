# Tests for LaunchBio

## Test Structure

```
__tests__/
  unit/              # Unit tests for isolated functions
    lib/
      validation.test.ts
      slug.test.ts
      utils/
        json.test.ts
  integration/       # Integration tests for Server Actions
    lib/
      auth.test.ts
      actions.test.ts
  api/               # Tests for API routes
    checkout.test.ts
    views.test.ts
  components/        # Component tests
    countdown.test.tsx
    view-tracker.test.tsx
    logout-button.test.tsx
    ui/
      button.test.tsx
  helpers/           # Helper functions for tests
    prisma-mock.ts
    cookies-mock.ts
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Coverage

### Unit Tests
- ✅ Password and page data validation
- ✅ Slug generation from titles
- ✅ Safe JSON parsing

### Integration Tests
- ✅ Authentication (registration, login, logout)
- ✅ Session management
- ✅ Page creation and updates
- ✅ Authorization checks
- ✅ Stripe integration (partial)

### API Routes
- ✅ `/api/checkout` - checkout session creation
- ✅ `/api/views` - view counter increment

### Components
- ✅ Countdown - countdown timer
- ✅ ViewTracker - view tracking
- ✅ Button - UI button component
- ✅ LogoutButton - logout button

## Notes

- Tests use Vitest with jsdom environment
- Prisma is mocked to isolate tests from database
- Next.js specific modules (cookies, cache) are mocked
- Stripe is mocked for testing payment functions

## Known Limitations

- Some Stripe tests require additional mock configuration
- E2E tests are not included (require Playwright/Cypress)
- Form component tests require additional setup
