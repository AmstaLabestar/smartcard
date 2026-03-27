async function listCards(_req, res) {
  res.status(200).json({
    success: true,
    message: 'Cards endpoint ready',
    data: [],
  });
}

module.exports = { listCards };
