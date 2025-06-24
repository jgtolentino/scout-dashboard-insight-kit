#!/bin/bash

echo "🧪 Verifying production build..."

npm run build

echo "✅ Checking output structure:"
ls -R dist

echo "🌐 Starting local server to test MIME types..."
npx serve dist -p 4173 &
sleep 2

curl -I http://localhost:4173/assets/index-DrNI8d6H.css | grep "Content-Type"
curl -I http://localhost:4173/assets/index-BH116y2N.js | grep "Content-Type"

echo "🛑 If you see 'text/html' here instead of correct MIME, something is broken."

kill %1