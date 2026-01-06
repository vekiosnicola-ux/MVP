#!/bin/bash

# Verify Setup Script
# Checks that everything is configured correctly

set -e

echo "🔍 Verifying setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILURES=0

# Check Supabase
echo "📊 Checking Supabase configuration..."
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✅ Supabase configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Supabase not fully configured in .env.local${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Check Sentry
echo ""
echo "🐛 Checking Sentry..."
if npm list @sentry/nextjs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Sentry package installed${NC}"
    if [ -f .env.local ] && grep -q "SENTRY_DSN" .env.local; then
        echo -e "${GREEN}✅ Sentry DSN configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Sentry DSN not configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Sentry not installed${NC}"
fi

# Check Vercel Analytics
echo ""
echo "📈 Checking Vercel Analytics..."
if npm list @vercel/analytics > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Vercel Analytics installed${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel Analytics not installed${NC}"
fi

# Check CI/CD
echo ""
echo "🔄 Checking CI/CD..."
if [ -f .github/workflows/test.yml ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow exists${NC}"
else
    echo -e "${RED}❌ GitHub Actions workflow missing${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Summary
echo ""
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ Setup looks good!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some setup items need attention${NC}"
    exit 1
fi

