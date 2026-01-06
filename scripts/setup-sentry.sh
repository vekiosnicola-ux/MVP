#!/bin/bash

# Sentry Setup Script
# Guides you through Sentry setup

set -e

echo "🔧 Setting up Sentry for error tracking..."
echo ""

# Check if Sentry is already installed
if npm list @sentry/nextjs > /dev/null 2>&1; then
    echo "✅ @sentry/nextjs is already installed"
else
    echo "📦 Installing @sentry/nextjs..."
    npm install --save @sentry/nextjs
fi

echo ""
echo "🚀 Running Sentry wizard..."
echo "This will configure Sentry in your Next.js app."
echo ""

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs

echo ""
echo "✅ Sentry setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Sentry DSN to .env.local:"
echo "   SENTRY_DSN=your-dsn-here"
echo ""
echo "2. (Optional) Add Sentry org and project:"
echo "   SENTRY_ORG=your-org"
echo "   SENTRY_PROJECT=your-project"
echo ""
echo "3. Test error tracking by triggering a test error"
echo ""

