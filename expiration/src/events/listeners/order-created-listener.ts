import { Listener, Subjects, OrderCreatedEvent } from '@ru-tickets/common';
import { EXPIRATION_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = EXPIRATION_SERVICE_QUEUE_GROUP;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

		await expirationQueue.add(
			{
				orderId: data.id,
			},
			{ delay }
		);

		msg.ack();
	}
}
