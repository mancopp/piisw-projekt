CREATE TABLE ticket_transaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    ticket_id BIGINT NOT NULL REFERENCES ticket(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_transaction_user_id ON ticket_transaction(user_id);
CREATE INDEX idx_ticket_transaction_created_at ON ticket_transaction(created_at DESC);

