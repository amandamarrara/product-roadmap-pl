#!/bin/sh

# Replace environment variables in JavaScript files if they exist
# This allows runtime configuration of Vite environment variables

if [ -f /usr/share/nginx/html/index.html ]; then
    # Create a temporary env file for JavaScript
    cat > /usr/share/nginx/html/env.js << EOF
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-https://onyscnytemwkjeeevtvh.supabase.co}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4}",
  VITE_SUPABASE_PROJECT_ID: "${VITE_SUPABASE_PROJECT_ID:-onyscnytemwkjeeevtvh}"
};
EOF
fi

# Execute the main command
exec "$@"