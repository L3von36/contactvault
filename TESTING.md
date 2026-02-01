# Testing Documentation

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
__tests__/
├── unit/                    # Unit tests for individual functions
│   ├── duress/
│   │   └── pin-hashing.test.ts
│   ├── utils/
│   │   └── contact-utils.test.ts
│   ├── import/
│   │   └── csv-parser.test.ts
│   └── contacts/
│       └── filtering.test.ts
└── integration/             # Integration tests for workflows
    └── contact-crud.test.ts
```

## Test Coverage

### Unit Tests

#### ✅ PIN Hashing & Validation
- Consistent hash generation
- Different PINs produce different hashes
- Edge case handling
- 6-digit PIN validation

#### ✅ Contact Utilities
- Phone number formatting (10-digit US format)
- Email validation (RFC-compliant)
- Name initials extraction

#### ✅ CSV Import Parsing
- Basic contact data parsing
- Column name variations (lowercase, uppercase)
- Company and job title fields
- Missing field handling
- Alternative column names

#### ✅ Contact Filtering
- Search by first name, last name, company, job title
- Case-insensitive search
- Status filtering (new, qualified, contacted)
- Favorites filtering
- Duress mode filtering (emergency-safe contacts only)

### Integration Tests

#### ✅ Contact CRUD Operations
- Create contact with auto-incrementing IDs
- Read all contacts and by ID
- Update contact fields
- Delete contacts
- Complete workflows (create → update → delete)

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Critical Functions | 80%+ | ✅ |
| Utility Functions | 90%+ | ✅ |
| Business Logic | 70%+ | ✅ |

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Workflow Name', () => {
  beforeEach(() => {
    // Setup
  })

  it('should complete workflow', () => {
    // Test multi-step process
  })
})
```

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly
3. **One Assertion Per Test**: Keep tests focused
4. **Mock External Dependencies**: Use mocks for API calls, database operations
5. **Test Edge Cases**: Include boundary conditions and error scenarios

## CI/CD Integration

Tests run automatically on:
- Pre-commit (optional)
- Pull requests
- Before deployment

## Troubleshooting

### Common Issues

**Issue**: Tests fail with module not found
**Solution**: Ensure `@/` path alias is configured in `jest.config.ts`

**Issue**: React component tests fail
**Solution**: Check that `jest-environment-jsdom` is installed

**Issue**: Async tests timeout
**Solution**: Increase timeout or check for unresolved promises
