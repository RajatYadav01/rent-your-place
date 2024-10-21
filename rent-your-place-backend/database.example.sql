CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    user_id uuid DEFAULT uuid_generate_v4(),
    user_first_name VARCHAR(255) NOT NULL, 
    user_last_name VARCHAR(255) NOT NULL, 
    user_email_address VARCHAR(255) UNIQUE NOT NULL,
    user_phone_number VARCHAR(20) NOT NULL,
    user_password VARCHAR(100) NOT NULL, 
    user_type VARCHAR(10) NOT NULL,
    user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- Create properties table
CREATE TABLE properties (
    property_id uuid DEFAULT uuid_generate_v4(),
    property_country VARCHAR(255) NOT NULL, 
    property_place VARCHAR(255) NOT NULL, 
    property_total_area NUMERIC(10, 2) NOT NULL, 
    property_number_of_bedrooms SMALLINT NOT NULL,
    property_number_of_bathrooms SMALLINT NOT NULL,
    property_nearby_landmark VARCHAR(255),
    property_rent_monthly NUMERIC(10, 2) NOT NULL,
    property_rent_currency_unit VARCHAR(15) NOT NULL,
    property_owner_id uuid REFERENCES users(user_id) NOT NULL,
    property_like_count INT,
    property_liked_by_user_ids uuid[],
    property_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    property_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (property_id, property_owner_id)
);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Check which table the trigger is associated with and update the respective column
    IF TG_TABLE_NAME = 'users' THEN
        NEW.user_updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_TABLE_NAME = 'properties' THEN
        NEW.property_updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for properties table
CREATE TRIGGER update_properties_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();