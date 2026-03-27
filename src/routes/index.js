const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const cardRoutes = require('../modules/card/card.routes');
const offerRoutes = require('../modules/offer/offer.routes');
const transactionRoutes = require('../modules/transaction/transaction.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('/offers', offerRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
