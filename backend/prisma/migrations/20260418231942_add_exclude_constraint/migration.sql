-- This is an empty migration.

-- Constraints For Booking
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlap_dates"
EXCLUDE USING GIST (
  "property_id" WITH =,
  tsrange("start_date", "end_date", '[)') WITH &&
)
WHERE ("status" IN ('CONFIRMED', 'PENDING', 'PAID'))