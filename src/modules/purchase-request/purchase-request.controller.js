const { createSuccessResponse } = require('../../utils/api-response');
const { sanitizePurchaseRequest } = require('../../utils/serializers');

async function createPurchaseRequest(req, res) {
  const purchaseRequest = await req.container.purchaseRequestService.createPurchaseRequest({
    userId: req.user.sub,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Purchase request created successfully',
      data: sanitizePurchaseRequest(purchaseRequest),
    }),
  );
}

async function listMyPurchaseRequests(req, res) {
  const purchaseRequests = await req.container.purchaseRequestService.listMyPurchaseRequests({
    userId: req.user.sub,
    pagination: req.query,
    status: req.query.status,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Purchase requests fetched successfully',
      data: purchaseRequests.items.map((purchaseRequest) => sanitizePurchaseRequest(purchaseRequest)),
      meta: purchaseRequests.meta,
    }),
  );
}

async function listAllPurchaseRequests(req, res) {
  const purchaseRequests = await req.container.purchaseRequestService.listAllPurchaseRequests({
    pagination: req.query,
    status: req.query.status,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Purchase requests fetched successfully',
      data: purchaseRequests.items.map((purchaseRequest) => sanitizePurchaseRequest(purchaseRequest)),
      meta: purchaseRequests.meta,
    }),
  );
}

async function approvePurchaseRequest(req, res) {
  const purchaseRequest = await req.container.purchaseRequestService.approvePurchaseRequest({
    purchaseRequestId: req.params.purchaseRequestId,
    reviewerId: req.user.sub,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Purchase request approved successfully',
      data: sanitizePurchaseRequest(purchaseRequest),
    }),
  );
}

async function rejectPurchaseRequest(req, res) {
  const purchaseRequest = await req.container.purchaseRequestService.rejectPurchaseRequest({
    purchaseRequestId: req.params.purchaseRequestId,
    reviewerId: req.user.sub,
    rejectionReason: req.body.rejectionReason,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Purchase request rejected successfully',
      data: sanitizePurchaseRequest(purchaseRequest),
    }),
  );
}

module.exports = {
  createPurchaseRequest,
  listMyPurchaseRequests,
  listAllPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
};
