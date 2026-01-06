-- CreateIndex
CREATE INDEX "Expense_category_date_idx" ON "Expense"("category", "date");

-- CreateIndex
CREATE INDEX "Transaction_date_barberId_idx" ON "Transaction"("date", "barberId");

-- CreateIndex
CREATE INDEX "Transaction_paymentMethod_date_idx" ON "Transaction"("paymentMethod", "date");

-- CreateIndex
CREATE INDEX "TransactionItem_type_idx" ON "TransactionItem"("type");

-- CreateIndex
CREATE INDEX "TransactionItem_serviceId_idx" ON "TransactionItem"("serviceId");

-- CreateIndex
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");
