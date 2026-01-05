#!/bin/bash

# Bootstrap Claude Code environment for this project
# Run this in a fresh clone to set up the Claude Code configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Claude Code Bootstrap"
echo "========================"
echo ""

cd "$PROJECT_ROOT"

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo "⚠️  Claude Code CLI not found."
    echo "   Install it from: https://claude.ai/code"
    echo ""
    echo "   After installing, run this script again."
    exit 1
fi

echo "✓ Claude Code CLI found"

# Verify .claude directory exists
if [ ! -d ".claude" ]; then
    echo "✗ .claude directory not found"
    echo "  This should have been cloned with the repository."
    exit 1
fi

echo "✓ .claude directory exists"

# Run verification script
echo ""
echo "Running setup verification..."
echo ""

if node scripts/verify-claude-setup.js; then
    echo ""
    echo "✓ Claude Code setup is complete!"
else
    echo ""
    echo "⚠️  Some checks failed. See above for details."
    exit 1
fi

# Optional: Configure MCP servers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MCP Server Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "MCP servers provide additional capabilities."
echo "Configure them manually if needed:"
echo ""
echo "  Supabase (database access):"
echo "    claude mcp add --transport http supabase \\"
echo "      'https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF' \\"
echo "      --header 'Authorization: Bearer YOUR_ACCESS_TOKEN'"
echo ""
echo "See .claude/README.md for more details."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setup complete. You're ready to use Claude Code."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
