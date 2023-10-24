import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@ru-tickets/common';
import { Request, Response, Router } from 'express';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

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

	new OrderCancelledPublisher(natsWrapper.client).publish({
		id: order.id,
		version: order.version,
		ticket: {
			id: order.ticket.id,
		},
	});

	res.status(204).send(order);
});

export { router as deleteOrderRouter };
