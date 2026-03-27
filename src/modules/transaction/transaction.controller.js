async function listTransactions(_req, res) {
  res.status(200).json({
    success: true,
    message: 'Transactions endpoint ready',
    data: [],
  });
}

module.exports = { listTransactions };
