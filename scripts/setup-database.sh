#!/bin/bash

# Setup script for direct database connection
# Supports PostgreSQL and MySQL

echo "Scout Analytics - Database Setup"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    cp .env.template .env
    echo "Created .env file from template"
fi

# Prompt for database type
echo ""
echo "Select your database type:"
echo "1) PostgreSQL"
echo "2) MySQL"
read -p "Enter choice (1 or 2): " db_choice

case $db_choice in
    1)
        DB_TYPE="postgres"
        DEFAULT_PORT="5432"
        PROTOCOL="postgresql"
        ;;
    2)
        DB_TYPE="mysql"
        DEFAULT_PORT="3306"
        PROTOCOL="mysql"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Prompt for connection method
echo ""
echo "Connection method:"
echo "1) Use connection string"
echo "2) Enter individual parameters"
read -p "Enter choice (1 or 2): " conn_choice

if [ "$conn_choice" == "1" ]; then
    # Connection string method
    echo ""
    echo "Enter your database connection string:"
    echo "Format: $PROTOCOL://user:password@host:port/database"
    read -p "Connection string: " conn_string
    
    # Update .env file
    sed -i.bak "s|VITE_DATABASE_URL=.*|VITE_DATABASE_URL=$conn_string|" .env
    sed -i.bak "s|VITE_DB_TYPE=.*|VITE_DB_TYPE=$DB_TYPE|" .env
    
else
    # Individual parameters method
    echo ""
    read -p "Database host (default: localhost): " db_host
    db_host=${db_host:-localhost}
    
    read -p "Database port (default: $DEFAULT_PORT): " db_port
    db_port=${db_port:-$DEFAULT_PORT}
    
    read -p "Database user: " db_user
    
    read -s -p "Database password: " db_password
    echo ""
    
    read -p "Database name: " db_name
    
    # Update .env file
    sed -i.bak "s|VITE_DB_TYPE=.*|VITE_DB_TYPE=$DB_TYPE|" .env
    sed -i.bak "s|VITE_DB_HOST=.*|VITE_DB_HOST=$db_host|" .env
    sed -i.bak "s|VITE_DB_PORT=.*|VITE_DB_PORT=$db_port|" .env
    sed -i.bak "s|VITE_DB_USER=.*|VITE_DB_USER=$db_user|" .env
    sed -i.bak "s|VITE_DB_PASSWORD=.*|VITE_DB_PASSWORD=$db_password|" .env
    sed -i.bak "s|VITE_DB_NAME=.*|VITE_DB_NAME=$db_name|" .env
    
    # Also build connection string
    conn_string="$PROTOCOL://$db_user:$db_password@$db_host:$db_port/$db_name"
    sed -i.bak "s|VITE_DATABASE_URL=.*|VITE_DATABASE_URL=$conn_string|" .env
fi

# Clean up backup files
rm -f .env.bak

echo ""
echo "Database configuration updated in .env file"

# Ask about installing database client
echo ""
echo "Would you like to install the necessary database client library?"
read -p "Install $DB_TYPE client? (y/n): " install_client

if [ "$install_client" == "y" ]; then
    if [ "$DB_TYPE" == "postgres" ]; then
        echo "Installing PostgreSQL client (pg)..."
        npm install pg @types/pg
    else
        echo "Installing MySQL client (mysql2)..."
        npm install mysql2
    fi
fi

echo ""
echo "Setup complete! You can now:"
echo "1. Run 'npm run dev' to start with mock data (VITE_USE_MOCKS=true)"
echo "2. Set VITE_USE_MOCKS=false to connect to your $DB_TYPE database"
echo ""
echo "To test the connection, you can create the schema using:"
echo "  $DB_TYPE < scout-analytics-complete/schema.sql"