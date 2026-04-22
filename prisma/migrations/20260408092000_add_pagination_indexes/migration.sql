-- CreateIndex
CREATE INDEX "Card_ownerId_idx" ON "Card"("ownerId");

-- CreateIndex
CREATE INDEX "Card_cardPlanId_idx" ON "Card"("cardPlanId");

-- CreateIndex
CREATE INDEX "Card_status_idx" ON "Card"("status");

-- CreateIndex
CREATE INDEX "Card_createdAt_idx" ON "Card"("createdAt");

-- CreateIndex
CREATE INDEX "CardOfferAccess_cardId_idx" ON "CardOfferAccess"("cardId");

-- CreateIndex
CREATE INDEX "CardOfferAccess_offerId_idx" ON "CardOfferAccess"("offerId");

-- CreateIndex
CREATE INDEX "CardPlanOffer_offerId_idx" ON "CardPlanOffer"("offerId");

-- CreateIndex
CREATE INDEX "Offer_creatorId_idx" ON "Offer"("creatorId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_cardId_idx" ON "Transaction"("cardId");

-- CreateIndex
CREATE INDEX "Transaction_offerId_idx" ON "Transaction"("offerId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_cardId_offerId_createdAt_idx" ON "Transaction"("cardId", "offerId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_offerId_createdAt_idx" ON "Transaction"("offerId", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
