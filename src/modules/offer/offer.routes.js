const express = require('express');

const { asyncHandler } = require('../../utils/async-handler');
const offerController = require('./offer.controller');

const router = express.Router();

router.get('/', asyncHandler(offerController.listOffers));

module.exports = router;
