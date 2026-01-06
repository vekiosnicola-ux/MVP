# Testing Quick Reference

**Quick access guide for daily testing and iteration work**

---

## Daily Checklist

### Morning (5 min)
- [ ] Check overnight error reports
- [ ] Review test results from last commit
- [ ] Check CI/CD pipeline status

### During Development
- [ ] Write tests alongside code
- [ ] Run `npm run test:watch` in background
- [ ] Fix failing tests before committing

### Before Committing
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run test` ✅
- [ ] All tests pass ✅

### End of Day
- [ ] Review test coverage changes
- [ ] Document any new test patterns
- [ ] Plan tomorrow's test work

---

## Weekly Checklist

### Monday
- [ ] Review previous week's metrics
- [ ] Plan week's testing priorities
- [ ] Update test backlog

### Wednesday
- [ ] Mid-week progress check
- [ ] Run full test suite
- [ ] Review any flaky tests

### Friday
- [ ] Week review and metrics
- [ ] Update test documentation
- [ ] Plan next week

---

## Test Commands

```bash
# Quick validation
npm run type-check          # TypeScript
npm run lint                # Code quality
npm run test                # Unit tests

# Development
npm run test:watch          # Watch mode
npm run test:ui:headed      # E2E with browser

# Comprehensive
npm run test:all            # All tests
npm run test:agents         # Agent tests
npm run test:contracts      # Contract tests
npm run test:simulation     # Simulation
npm run test:ui             # E2E tests
```

---

## Test Coverage Targets

| Type | Target | Current |
|------|--------|---------|
| Unit | ≥70% | TBD |
| Integration | ≥80% | TBD |
| E2E | Critical paths | TBD |

---

## Common Issues & Fixes

### Tests Failing
1. Check error message
2. Run specific test file: `npm run test -- path/to/test.ts`
3. Check test data/fixtures
4. Verify database connection

### CI Failing
1. Check GitHub Actions logs
2. Run tests locally: `npm run test:all`
3. Check environment variables
4. Verify dependencies

### Flaky Tests
1. Add retry logic
2. Improve test isolation
3. Check for race conditions
4. Review test data setup

---

## Quick Links

- [Full Testing Plan](./TESTING_ITERATION_PLAN.md)
- [Testing Strategy](./TESTING.md)
- [Chat Testing Guide](./CHAT_TESTING.md)
- [Test README](../src/__tests__/README.md)

---

**Last Updated**: 2025-01-04

