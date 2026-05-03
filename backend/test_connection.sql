-- Test your Supabase database connection
-- Run this in your Supabase SQL Editor or with psql

-- Test basic connection
SELECT 'Database Connected Successfully!' as status;

-- Test current user
SELECT current_user as current_user;

-- Test database version
SELECT version() as database_version;

-- Test if we can create tables (for verification)
CREATE TABLE IF NOT EXISTS connection_test (
    id SERIAL PRIMARY KEY,
    test_message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO connection_test (test_message) 
VALUES ('CryptLink Database Test - ' || CURRENT_TIMESTAMP);

-- Verify data insertion
SELECT * FROM connection_test ORDER BY id DESC LIMIT 1;

-- Clean up test table
DROP TABLE IF EXISTS connection_test;
