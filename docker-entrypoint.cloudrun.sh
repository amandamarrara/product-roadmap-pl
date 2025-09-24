#!/bin/sh

# Cloud Run entrypoint script
# Handles dynamic port configuration and runtime environment variables

set -e

# Set default port if not provided by Cloud Run
export PORT=${PORT:-8080}

echo "Starting application on port: $PORT"

# Create runtime environment configuration for the frontend
if [ -f /usr/share/nginx/html/index.html ]; then
    echo "Creating runtime environment configuration..."
    
    # Create env.js file with runtime environment variables
    cat > /usr/share/nginx/html/env.js << EOF
// Runtime environment configuration for Cloud Run
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-https://onyscnytemwkjeeevtvh.supabase.co}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4}",
  VITE_SUPABASE_PROJECT_ID: "${VITE_SUPABASE_PROJECT_ID:-onyscnytemwkjeeevtvh}"
};

// Make environment variables available globally
if (typeof window !== 'undefined') {
  Object.assign(import.meta.env || {}, window.ENV);
}
EOF

    echo "Environment configuration created successfully"
    
    # Inject env.js script into index.html if not already present
    if ! grep -q "env.js" /usr/share/nginx/html/index.html; then
        sed -i 's|</head>|    <script src="/env.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
        echo "Environment script injected into index.html"
    fi
else
    echo "Warning: index.html not found, skipping environment configuration"
fi

# Process nginx configuration template with environment variables
echo "Processing nginx configuration template..."
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Validate nginx configuration
echo "Validating nginx configuration..."
nginx -t

echo "Starting nginx..."

# Execute the main command (nginx)
exec "$@"