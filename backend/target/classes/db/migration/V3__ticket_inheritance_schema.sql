-- Add ticket_type discriminator column to ticket table
ALTER TABLE ticket ADD COLUMN ticket_type VARCHAR(32) NOT NULL DEFAULT 'SINGLE';

-- Create single_use_ticket table (inherits from ticket)
CREATE TABLE single_use_ticket (
    id BIGINT PRIMARY KEY REFERENCES ticket(id) ON DELETE CASCADE
);

-- Create time_based_ticket table (inherits from ticket)
CREATE TABLE time_based_ticket (
    id BIGINT PRIMARY KEY REFERENCES ticket(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL
);

-- Create period_ticket table (inherits from ticket)
CREATE TABLE period_ticket (
    id BIGINT PRIMARY KEY REFERENCES ticket(id) ON DELETE CASCADE,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL
);

-- Migrate existing tickets based on ticket_offer type
-- Insert into appropriate subclass table
INSERT INTO single_use_ticket (id)
    SELECT t.id FROM ticket t
    JOIN ticket_offer o ON t.offer_id = o.id
    WHERE o.ticket_type = 'SINGLE' AND t.ticket_type = 'SINGLE';

INSERT INTO time_based_ticket (id, duration_minutes)
    SELECT t.id, o.duration_minutes FROM ticket t
    JOIN ticket_offer o ON t.offer_id = o.id
    WHERE o.ticket_type = 'TIME' AND t.ticket_type = 'SINGLE'
    AND o.duration_minutes IS NOT NULL;

UPDATE ticket SET ticket_type = 'TIME'
    WHERE id IN (
        SELECT t.id FROM ticket t
        JOIN ticket_offer o ON t.offer_id = o.id
        WHERE o.ticket_type = 'TIME'
    );

INSERT INTO period_ticket (id, valid_from, valid_to)
    SELECT t.id, t.valid_from, t.valid_to FROM ticket t
    JOIN ticket_offer o ON t.offer_id = o.id
    WHERE o.ticket_type = 'PERIOD' AND t.ticket_type = 'SINGLE'
    AND t.valid_from IS NOT NULL AND t.valid_to IS NOT NULL;

UPDATE ticket SET ticket_type = 'PERIOD'
    WHERE id IN (
        SELECT t.id FROM ticket t
        JOIN ticket_offer o ON t.offer_id = o.id
        WHERE o.ticket_type = 'PERIOD'
    );

-- Remove old columns that are now in subclass tables
ALTER TABLE ticket DROP COLUMN valid_from;
ALTER TABLE ticket DROP COLUMN valid_to;

-- Add NOT NULL constraint to ticket_type
ALTER TABLE ticket ALTER COLUMN ticket_type SET NOT NULL;
