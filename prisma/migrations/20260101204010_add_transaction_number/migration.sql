-- Add transactionNumber column with default value
ALTER TABLE "Transaction" ADD COLUMN "transactionNumber" INTEGER NOT NULL DEFAULT 1;

-- Update existing transactions with proper numbering
WITH ordered_transactions AS (
  SELECT 
    id,
    date::date as transaction_date,
    ROW_NUMBER() OVER (PARTITION BY date::date ORDER BY date) as row_num
  FROM "Transaction"
)
UPDATE "Transaction"
SET "transactionNumber" = ot.row_num
FROM ordered_transactions ot
WHERE "Transaction".id = ot.id;

-- Add unique constraint for transactionNumber and date
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transactionNumber_date_key" UNIQUE ("transactionNumber", "date");
