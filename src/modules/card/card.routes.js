const express = require('express');

const { asyncHandler } = require('../../utils/async-handler');
const cardController = require('./card.controller');

const router = express.Router();

router.get('/', asyncHandler(cardController.listCards));

module.exports = router;
