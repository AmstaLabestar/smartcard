async function listUsers(_req, res) {
  res.status(200).json({
    success: true,
    message: 'Users endpoint ready',
    data: [],
  });
}

module.exports = { listUsers };
