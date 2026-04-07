#!/bin/bash
set -e

PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
STANDALONE_PATH="$PROJECT_ROOT/.next/standalone"
OUTPUT_ZIP="$PROJECT_ROOT/nabtravel-deploy.zip"

echo ""
echo -e "\e[36m========================================\e[0m"
echo -e "\e[36m  NabTravel - Build and Package Deploy\e[0m"
echo -e "\e[36m========================================\e[0m"
echo ""

# --- Step 1: Build ---
echo -e "\e[33m[1/4] Building Next.js (standalone mode)...\e[0m"
cd "$PROJECT_ROOT"

if npm run build; then
    echo -e "\e[32m  OK Build succeeded\e[0m"
else
    echo -e "\e[31m  X Build failed!\e[0m"
    exit 1
fi

if [ ! -d "$STANDALONE_PATH" ]; then
    echo -e "\e[31m  X Folder .next/standalone/ not found!\e[0m"
    echo -e "\e[31m    Check next.config.ts has output: standalone\e[0m"
    exit 1
fi

# --- Step 2: Copy static assets ---
echo -e "\e[33m[2/4] Copying static assets...\e[0m"

PUBLIC_SRC="$PROJECT_ROOT/public"
PUBLIC_DEST="$STANDALONE_PATH/public"
rm -rf "$PUBLIC_DEST"
cp -r "$PUBLIC_SRC" "$PUBLIC_DEST"
echo -e "\e[32m  OK public/ copied\e[0m"

STATIC_SRC="$PROJECT_ROOT/.next/static"
STATIC_DEST="$STANDALONE_PATH/.next/static"
rm -rf "$STATIC_DEST"
mkdir -p "$STANDALONE_PATH/.next"
cp -r "$STATIC_SRC" "$STATIC_DEST"
echo -e "\e[32m  OK .next/static/ copied\e[0m"

# --- Step 3: Copy app.js ---
echo -e "\e[33m[3/4] Copying Passenger entry point (app.js)...\e[0m"
APP_JS_SRC="$PROJECT_ROOT/app.js"
APP_JS_DEST="$STANDALONE_PATH/app.js"
if [ -f "$APP_JS_SRC" ]; then
    cp "$APP_JS_SRC" "$APP_JS_DEST"
    echo -e "\e[32m  OK app.js copied\e[0m"
else
    echo -e "\e[31m  X app.js not found at $APP_JS_SRC\e[0m"
    exit 1
fi

# --- Step 4: Create ZIP ---
echo -e "\e[33m[4/4] Creating deployment package...\e[0m"
rm -f "$OUTPUT_ZIP"
cd "$STANDALONE_PATH"
zip -qr "$OUTPUT_ZIP" .

ZIP_SIZE=$(du -m "$OUTPUT_ZIP" | cut -f1)
echo -e "\e[32m  OK Created: nabtravel-deploy.zip (${ZIP_SIZE} MB)\e[0m"

echo ""
echo -e "\e[32m========================================\e[0m"
echo -e "\e[32m  Deploy package ready!\e[0m"
echo -e "\e[32m========================================\e[0m"
echo ""
echo -e "\e[36mNext steps:\e[0m"
echo "  1. Upload nabtravel-deploy.zip to cPanel File Manager"
echo "  2. Extract to /home/username/nabtravel/"
echo "  3. Setup Node.js App in cPanel (see DEPLOY.md)"
echo ""
