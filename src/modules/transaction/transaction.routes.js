const express = require('express');

const { asyncHandler } = require('../../utils/async-handler');
const transactionController = require('./transaction.controller');

const router = express.Router();

router.get('/', asyncHandler(transactionController.listTransactions));

module.exports = router;
