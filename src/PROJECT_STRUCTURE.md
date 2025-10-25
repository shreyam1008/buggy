# Project Structure

This project follows modern React best practices with a feature-based architecture.

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, Card, etc.)
│   └── features/        # Feature-specific components (PhotoUploadEditor)
│
├── features/            # Feature modules (domain-driven)
│   ├── dashboard/       # Dashboard feature
│   ├── devotee/         # Add/Edit devotee feature
│   ├── bulk-entry/      # Bulk entry feature
│   └── person-profile/  # Person profile feature
│
├── services/            # API and external services
│   ├── api.ts           # Mock API service
│   └── mockData.ts      # Data generation utilities
│
├── utils/               # Utility functions
│   └── imageCompression.ts  # Image processing utilities
│
├── types/               # TypeScript type definitions
│   └── index.ts         # Centralized type exports
│
├── config/              # Configuration files
│   ├── constants.ts     # Application constants
│   └── queryClient.ts   # React Query configuration
│
├── hooks/               # Custom React hooks
│
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Architecture Principles

### 1. **Separation of Concerns**
- UI components are separated from business logic
- Services handle all API interactions
- Types are centralized for consistency

### 2. **Feature-Based Organization**
- Each feature is self-contained in its own directory
- Features can include components, hooks, and utilities specific to that feature
- Promotes modularity and scalability

### 3. **Component Hierarchy**
- **UI Components** (`components/ui/`): Presentational, reusable, no business logic
- **Feature Components** (`components/features/`): Complex, feature-specific components
- **Feature Modules** (`features/`): Complete features with their own logic

### 4. **Type Safety**
- All types defined in `types/index.ts`
- Consistent interfaces across the application
- TypeScript strict mode enabled

### 5. **Code Reusability**
- Barrel exports (`index.ts`) for clean imports
- Shared utilities in `utils/`
- Centralized configuration in `config/`

## Import Patterns

### Good ✅
```typescript
import { Button, Card, Input } from '@/components/ui';
import { mockAPI } from '@/services/api';
import { Person, Visit } from '@/types';
```

### Avoid ❌
```typescript
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
// Use barrel exports instead
```

## Adding New Features

1. Create a new directory in `features/`
2. Add feature components and logic
3. Export via `index.ts`
4. Import in `App.tsx`

## Component Guidelines

### UI Components
- Should be pure and presentational
- Accept props for all data and callbacks
- No direct API calls or business logic
- Fully typed with TypeScript interfaces

### Feature Components
- Can contain business logic
- Use React Query for data fetching
- Handle their own state management
- Composed of UI components

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `PhotoUploadEditor.tsx`)
- **Utilities**: camelCase (e.g., `imageCompression.ts`)
- **Types**: PascalCase interfaces (e.g., `Person`, `Visit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `NATIONALITIES`, `PURPOSES`)

## State Management

- **Local State**: `useState` for component-specific state
- **Server State**: React Query for API data
- **Form State**: Local state with controlled components
- **Global State**: Context API (when needed)

## Testing Strategy (Future)

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
├── features/
│   └── dashboard/
│       ├── Dashboard.tsx
│       └── Dashboard.test.tsx
```

## Performance Considerations

- React Query handles caching and refetching
- Components use `useMemo` and `useCallback` where appropriate
- Lazy loading for routes (future enhancement)
- Image compression for optimal performance

## Future Enhancements

- [ ] Add route-based code splitting
- [ ] Implement error boundaries
- [ ] Add comprehensive testing
- [ ] Set up Storybook for component documentation
- [ ] Add internationalization (i18n)
- [ ] Implement proper authentication
- [ ] Add real API integration
