#!/bin/bash
# Run this from the root of your Portfolio-2026 repo (where package.json lives)
set -e

echo "Moving pages into folders..."
names="about adobe-cis adobe-cos airwaves beneath-the-surface breathscape coral-bleaching coral-chronicles dogs-with-jobs play poster-index sixth-street-logo sixth-street-rebrand"

for f in $names; do
  mkdir -p "$f"
  git mv "$f.html" "$f/index.html"
done

echo "Updating internal links (removing .html, adding trailing slash)..."
files=$(find . -maxdepth 2 -name "index.html" -not -path "./dist/*" -not -path "./node_modules/*")
for n in $names; do
  for f in $files; do
    sed -i "s#href=\"/$n\.html\"#href=\"/$n/\"#g" "$f"
  done
done

echo "Done with file moves and link updates."
echo "IMPORTANT: you still need to manually update vite.config.js — see instructions below."