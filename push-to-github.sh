#!/bin/bash

# Script to push code to GitHub
# Run this manually: bash push-to-github.sh

echo "🚀 Pushing code to GitHub..."
echo ""

# Push to GitHub
git push origin main --force

echo ""
echo "✅ Code pushed to GitHub!"
echo "🔄 Vercel will automatically deploy from GitHub"
echo ""
echo "Check deployment status at:"
echo "https://vercel.com/ahmads-projects-c1a9f272/kwapps"
