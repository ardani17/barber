-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_date_barberId_idx" ON "Transaction"("date", "barberId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_paymentMethod_date_idx" ON "Transaction"("paymentMethod", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransactionItem_productId_idx" ON "TransactionItem"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransactionItem_serviceId_idx" ON "TransactionItem"("serviceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransactionItem_type_idx" ON "TransactionItem"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Expense_category_date_idx" ON "Expense"("category", "date");
