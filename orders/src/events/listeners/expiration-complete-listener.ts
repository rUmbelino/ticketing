import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@ru-tickets/common';
import { ORDERS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	queueGroupName = ORDERS_SERVICE_QUEUE_GROUP;
	readonly subject = Subjects.ExpirationComplete;

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
		const order = await Order.findById(data.orderId).populate('ticket');

		if (!order) {
			throw new Error('Order not found');
		}

		if (order.status === OrderStatus.Complete) {
			console.log('order already complete');
			msg.ack();
		}

		order.set({ status: OrderStatus.Cancelled });
		await order.save();

		await new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});

		msg.ack();
	}
}
