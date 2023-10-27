import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@ru-tickets/common';
import { ORDERS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = ORDERS_SERVICE_QUEUE_GROUP;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
		const order = await Order.findById(data.orderId);
		if (!order) {
			throw new Error('order not found');
		}

		order.set({
			staus: OrderStatus.Complete,
		});
		await order.save();

		msg.ack();
	}
}
