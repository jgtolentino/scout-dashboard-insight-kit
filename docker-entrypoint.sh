#!/bin/sh

# Start backend API in background
cd /app/backend
gunicorn app:app -b 0.0.0.0:5000 --workers 4 &

# Start nginx in foreground
nginx -g 'daemon off;'