#!/bin/bash

# Quality Gates Script
# Runs all quality checks before deployment

echo "🚀 Running Quality Gates..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check and report
# Usage: run_check "description" command [args...]
run_check() {
    local description="$1"
    shift
    
    echo ""
    echo "📝 $description..."
    if "$@"; then
        echo -e "${GREEN}✅ $description${NC}"
    else
        echo -e "${RED}❌ $description${NC}"
        FAILURES=$((FAILURES + 1))
    fi
}

# 1. Type Check
run_check "Type Check" npm run type-check

# 2. Lint
run_check "Lint" npm run lint

# 3. Unit Tests
run_check "Unit Tests" npm run test

# 4. Test Coverage
run_check "Test Coverage" npm run test:coverage

# Check coverage threshold (70%)
echo ""
echo "📊 Checking coverage threshold..."
COVERAGE=$(npm run test:coverage 2>&1 | grep -oP 'All files\s+\|\s+\d+\.\d+' | awk '{print $3}' | head -1)
if [ ! -z "$COVERAGE" ]; then
    COVERAGE_INT=$(echo $COVERAGE | cut -d. -f1)
    if [ "$COVERAGE_INT" -lt 70 ]; then
        echo -e "${YELLOW}⚠️  Coverage is ${COVERAGE}% (target: 70%+)${NC}"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}✅ Coverage: ${COVERAGE}%${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine coverage percentage${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 5. Build Check
run_check "Build" npm run build

# Summary
echo ""
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 All quality gates passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ ${FAILURES} quality gate(s) failed${NC}"
    exit 1
fi

