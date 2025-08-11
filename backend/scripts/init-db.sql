-- Initialize database for Docker deployment
-- This script runs when the PostgreSQL container starts for the first time

-- Ensure the database exists (it should be created by environment variables)
-- SELECT 'CREATE DATABASE personality_survey' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'personality_survey');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE personality_survey TO survey_user;

-- Connect to the database
\c personality_survey;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO survey_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO survey_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO survey_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO survey_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO survey_user;