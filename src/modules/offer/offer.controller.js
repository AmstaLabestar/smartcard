async function listOffers(_req, res) {
  res.status(200).json({
    success: true,
    message: 'Offers endpoint ready',
    data: [],
  });
}

module.exports = { listOffers };
