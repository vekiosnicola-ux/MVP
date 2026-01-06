#!/bin/bash

# Quality Gates Script
# Runs all quality checks before deployment

set -e  # Exit on error

echo "🚀 Running Quality Gates..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check and report
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        FAILURES=$((FAILURES + 1))
    fi
}

# 1. Type Check
echo ""
echo "📝 Running TypeScript type check..."
npm run type-check
check "Type check"

# 2. Lint
echo ""
echo "🔍 Running ESLint..."
npm run lint
check "Lint"

# 3. Unit Tests
echo ""
echo "🧪 Running unit tests..."
npm run test
check "Unit tests"

# 4. Test Coverage
echo ""
echo "📊 Checking test coverage..."
npm run test:coverage
check "Test coverage"

# Check coverage threshold (70%)
COVERAGE=$(npm run test:coverage 2>&1 | grep -oP 'All files\s+\|\s+\d+\.\d+' | awk '{print $3}' | head -1)
if [ ! -z "$COVERAGE" ]; then
    COVERAGE_INT=$(echo $COVERAGE | cut -d. -f1)
    if [ "$COVERAGE_INT" -lt 70 ]; then
        echo -e "${YELLOW}⚠️  Coverage is ${COVERAGE}% (target: 70%+)${NC}"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}✅ Coverage: ${COVERAGE}%${NC}"
    fi
fi

# 5. Build Check
echo ""
echo "🏗️  Building application..."
npm run build
check "Build"

# Summary
echo ""
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 All quality gates passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ ${FAILURES} quality gate(s) failed${NC}"
    exit 1
fi

