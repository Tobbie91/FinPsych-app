#!/bin/bash

# Clear Database Script
# Removes all applicant data while preserving admin accounts

set -e

echo "⚠️  WARNING: This will delete ALL applicant data from the database!"
echo "Admin accounts will be preserved."
echo ""
read -p "Are you sure you want to continue? (type 'yes' to proceed): " confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Operation cancelled."
  exit 1
fi

echo ""
echo "🗑️  Clearing database..."

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
  # Use Supabase CLI
  echo "Using Supabase CLI..."
  supabase db execute -f supabase/migrations/clear_database_keep_admin.sql
else
  # Provide alternative instructions
  echo "⚠️  Supabase CLI not found."
  echo ""
  echo "To run this migration, you have two options:"
  echo ""
  echo "Option 1: Install Supabase CLI and run:"
  echo "  supabase db push"
  echo ""
  echo "Option 2: Run the SQL file directly against your database:"
  echo "  psql -d your_database < supabase/migrations/clear_database_keep_admin.sql"
  echo ""
  exit 1
fi

echo "✅ Database cleared successfully!"
echo "📊 Applicant data removed, admin accounts preserved."
