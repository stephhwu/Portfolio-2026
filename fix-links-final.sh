#!/bin/bash
set -e

names="about adobe-cis adobe-cos airwaves beneath-the-surface breathscape coral-bleaching coral-chronicles dogs-with-jobs play poster-index sixth-street-logo sixth-street-rebrand"
files=$(find . -maxdepth 2 -name "index.html" -not -path "./dist/*" -not -path "./node_modules/*")

echo "Stripping /Portfolio-2026/ prefix from all links..."
for f in $files; do
  sed -i '' 's#/Portfolio-2026/#/#g' "$f"
done

echo "Converting remaining .html links to trailing-slash folder links..."
for n in $names; do
  for f in $files; do
    sed -i '' "s#href=\"/$n\.html\"#href=\"/$n/\"#g" "$f"
  done
done

echo "---"
echo "Checking for any leftover bad links:"
grep -rn 'Portfolio-2026\|href="/[a-z-]*\.html"' --include="index.html" . 2>/dev/null | grep -v node_modules | grep -v '/dist/' && echo "^ STILL FOUND SOME — see above" || echo "ALL CLEAN"
