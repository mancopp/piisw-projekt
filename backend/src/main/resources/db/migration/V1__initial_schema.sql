CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_offer (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    ticket_type VARCHAR(32) NOT NULL,
    fare_type VARCHAR(32) NOT NULL,
    duration_minutes INTEGER,
    validity_days INTEGER,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE ticket (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    offer_id BIGINT NOT NULL REFERENCES ticket_offer(id),
    code VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL,
    purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP,
    activated_vehicle_id VARCHAR(64),
    valid_from TIMESTAMP,
    valid_to TIMESTAMP
);

CREATE INDEX idx_ticket_user_id ON ticket(user_id);
CREATE INDEX idx_ticket_code ON ticket(code);
