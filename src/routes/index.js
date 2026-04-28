const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const meRoutes = require('../modules/me/me.routes');
const userRoutes = require('../modules/user/user.routes');
const cardRoutes = require('../modules/card/card.routes');
const cardPlanRoutes = require('../modules/card-plan/card-plan.routes');
const offerRoutes = require('../modules/offer/offer.routes');
const purchaseRequestRoutes = require('../modules/purchase-request/purchase-request.routes');
const transactionRoutes = require('../modules/transaction/transaction.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('/card-plans', cardPlanRoutes);
router.use('/offers', offerRoutes);
router.use('/purchase-requests', purchaseRequestRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
