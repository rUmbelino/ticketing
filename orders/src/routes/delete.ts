import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@ru-tickets/common';
import { Request, Response, Router } from 'express';
import { Order } from '../models/order';

const router = Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
	const order = await Order.findById(req.params.orderId).populate('ticket');
	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser?.id) {
		throw new NotAuthorizedError();
	}

	order.status = OrderStatus.Cancelled;
	order.save();

	res.status(204).send(order);
});

export { router as deleteOrderRouter };
