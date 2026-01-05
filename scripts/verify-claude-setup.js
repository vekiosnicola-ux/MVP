#!/usr/bin/env node

/**
 * Verify Claude Code setup is complete and correct.
 * Run with: npm run claude:verify
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(ROOT, '.claude');

const checks = {
  passed: 0,
  failed: 0,
  issues: [],
};

function check(name, condition, fixHint) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    checks.passed++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    checks.failed++;
    checks.issues.push({ name, fixHint });
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function readFile(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  } catch {
    return null;
  }
}

console.log('\n\x1b[1mClaude Code Setup Verification\x1b[0m');
console.log('==============================\n');

// Required Files
console.log('\x1b[36mRequired Files:\x1b[0m');
check('.claude/settings.json', fileExists('.claude/settings.json'), 'Create settings.json - see .claude/README.md');
check('.claude/README.md', fileExists('.claude/README.md'), 'Create .claude/README.md');
check('.claude/agents/coordinator.md', fileExists('.claude/agents/coordinator.md'), 'Create coordinator agent definition');
check('.claude/skills/dieta-positiva-context/skill.md', fileExists('.claude/skills/dieta-positiva-context/skill.md'), 'Create project context skill');
check('.claude/skills/run-test-suite/skill.md', fileExists('.claude/skills/run-test-suite/skill.md'), 'Create test suite skill');
check('CLAUDE.md', fileExists('CLAUDE.md'), 'Create CLAUDE.md with project instructions');

console.log('\n\x1b[36mSettings Validation:\x1b[0m');
const settings = readJson('.claude/settings.json');
if (settings) {
  check(
    'subagents.default_instructions defined',
    settings.subagents?.default_instructions,
    'Add subagents.default_instructions to settings.json'
  );
  check(
    'hooks.SubagentStop configured',
    settings.hooks?.SubagentStop?.length > 0,
    'Add SubagentStop hook to settings.json'
  );
} else {
  check('settings.json is valid JSON', false, 'Fix JSON syntax in settings.json');
}

console.log('\n\x1b[36mGit Configuration:\x1b[0m');
const gitignore = readFile('.gitignore') || '';
check(
  'settings.local.json in .gitignore',
  gitignore.includes('settings.local.json'),
  'Add ".claude/settings.local.json" to .gitignore'
);
// Check if .claude/ itself is ignored (not just specific files within it)
const claudeDirIgnored = gitignore.split('\n').some(line => {
  const trimmed = line.trim();
  return trimmed === '.claude/' || trimmed === '.claude' || trimmed === '/.claude/';
});
check(
  '.claude/ tracked (not ignored)',
  !claudeDirIgnored,
  'Ensure .claude/ is tracked in git (remove from .gitignore if present)'
);

console.log('\n\x1b[36mProject Files:\x1b[0m');
check('package.json', fileExists('package.json'), 'Initialize npm project');
check('CLAUDE.md', fileExists('CLAUDE.md'), 'Create project instructions');
check('DECISIONS.md', fileExists('DECISIONS.md'), 'Create architectural decision log');

// Summary
console.log('\n' + '='.repeat(30));
if (checks.failed === 0) {
  console.log(`\x1b[32m✓ All ${checks.passed} checks passed\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ ${checks.failed} issue(s) found\x1b[0m\n`);
  console.log('\x1b[33mTo fix:\x1b[0m');
  checks.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.name}`);
    console.log(`     → ${issue.fixHint}`);
  });
  console.log('\nSee .claude/README.md for detailed setup instructions.\n');
  process.exit(1);
}
