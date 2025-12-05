#!/bin/bash
#
# Rollback Script for UI System Integration
# KW APPS - Multi-Agent System Update
#
# This script reverts all changes made during the UI system integration.
# Run this if you need to revert to the previous state.
#

set -e  # Exit on error

echo "========================================="
echo "  KW APPS UI System Integration Rollback"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm rollback
read -p "$(echo -e ${YELLOW}Warning: This will revert all UI system integration changes. Continue? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Rollback cancelled."
    exit 1
fi

echo ""
echo "Step 1/6: Removing new prompt files..."
if [ -d "prompts" ]; then
    rm -rf prompts/
    echo -e "${GREEN}✓ Removed prompts/ directory${NC}"
else
    echo -e "${YELLOW}⚠ prompts/ directory not found, skipping${NC}"
fi

echo ""
echo "Step 2/6: Removing agent prompt files..."
if [ -d "src/lib/agents/prompts" ]; then
    rm -rf src/lib/agents/prompts/
    echo -e "${GREEN}✓ Removed agent prompt files${NC}"
else
    echo -e "${YELLOW}⚠ Agent prompts directory not found, skipping${NC}"
fi

echo ""
echo "Step 3/6: Removing Claude.md..."
if [ -f "Claude.md" ]; then
    rm -f Claude.md
    echo -e "${GREEN}✓ Removed Claude.md${NC}"
else
    echo -e "${YELLOW}⚠ Claude.md not found, skipping${NC}"
fi

echo ""
echo "Step 4/6: Restoring modified DeepSeek client..."
if git diff --quiet HEAD src/lib/deepseek/client.ts 2>/dev/null; then
    echo -e "${YELLOW}⚠ src/lib/deepseek/client.ts has no changes, skipping${NC}"
else
    git restore src/lib/deepseek/client.ts 2>/dev/null || echo -e "${RED}✗ Could not restore src/lib/deepseek/client.ts${NC}"
    echo -e "${GREEN}✓ Restored src/lib/deepseek/client.ts${NC}"
fi

echo ""
echo "Step 5/6: Restoring modified API route..."
if git diff --quiet HEAD src/app/api/generate/route.ts 2>/dev/null; then
    echo -e "${YELLOW}⚠ src/app/api/generate/route.ts has no changes, skipping${NC}"
else
    git restore src/app/api/generate/route.ts 2>/dev/null || echo -e "${RED}✗ Could not restore src/app/api/generate/route.ts${NC}"
    echo -e "${GREEN}✓ Restored src/app/api/generate/route.ts${NC}"
fi

echo ""
echo "Step 6/6: Verifying rollback..."
echo ""
echo "Git status:"
git status --short

echo ""
echo "========================================="
echo -e "${GREEN}✓ Rollback complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to verify the build works"
echo "2. Run 'npm run dev' to test the application"
echo "3. If issues persist, check git log for the original state"
echo ""
echo "To re-apply the UI system integration, re-run the update process."
echo ""
