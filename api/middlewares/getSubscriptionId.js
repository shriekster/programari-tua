const subscriptionIdRegex = /^[a-zA-Z0-9]{16}$/;

export default function getSubcriptionId(req, res, next) {

    const subscriptionId = req.headers?.['x-subscription-id'] ?? '';
    const isSubcriptionId = subscriptionIdRegex.test(subscriptionId);

    if (isSubcriptionId) {

        req.subcriptionId = subscriptionId;

    }

    next();

};