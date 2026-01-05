#!/bin/bash
# Complete setup script for fresh instance
# Run with: bash scripts/setup-fresh-instance.sh

set -e  # Exit on any error

echo "🚀 Setting up Aura MVP on fresh instance..."
echo ""

# 1. Verify we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in the MVP directory?"
  exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# 3. Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "🔧 Creating .env.local..."
  cat > .env.local << 'EOF'
# Environment Configuration
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fevouizqcuvahrdtwoif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eD5SkLCA-MQjCV_UvfdZ7g_uNHxIFTB
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldm91aXpxY3V2YWhyZHR3b2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzUzNTU4MSwiZXhwIjoyMDgzMTExNTgxfQ.Zpoe5FVhWrPlbxlOL9aHcMJQ5ILYrBbig63u37Vqmrc

# Anthropic API (optional - for AI features)
ANTHROPIC_API_KEY=your-key-here

# Server Configuration
PORT=3000
EOF
  echo "✅ .env.local created"
else
  echo "ℹ️  .env.local already exists, skipping..."
fi
echo ""

# 4. Run type check
echo "🔍 Running TypeScript type check..."
npm run type-check
echo "✅ Type check passed"
echo ""

# 5. Test build
echo "🏗️  Testing production build..."
npm run build
echo "✅ Build successful"
echo ""

# 6. Verify database connection (optional)
echo "🗄️  Verifying database connection..."
if command -v npx &> /dev/null; then
  npx tsx scripts/verify-db.ts || echo "⚠️  Database verification failed (may be expected in some environments)"
else
  echo "⚠️  npx not available, skipping database verification"
fi
echo ""

# 7. Clean up any stuck processes
echo "🧹 Cleaning up ports..."
bash scripts/cleanup-ports.sh 2>/dev/null || echo "⚠️  Cleanup script not executable or not found"
echo ""

# 8. Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup complete! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "  1. Start dev server:    npm run dev"
echo "  2. Open browser:        http://localhost:3000"
echo "  3. Check API health:    http://localhost:3000/api/health"
echo "  4. View deployment:     https://dieta-positiva-mvp.vercel.app"
echo ""
echo "📚 Documentation:"
echo "  - README.md             Project overview"
echo "  - CLAUDE.md             Development guidelines"
echo "  - docs/SETUP_COMPLETE.md   Detailed setup status"
echo ""
