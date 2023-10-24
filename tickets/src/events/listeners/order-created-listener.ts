import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from '@ru-tickets/common';
import { TICKETS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicektUpdaterPublisher } from '../publisher/ticket-upadated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = TICKETS_SERVICE_QUEUE_GROUP;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) {
			throw new Error('Ticket not found!');
		}

		ticket.set({ orderId: data.id });

		await ticket.save();
		await new TicektUpdaterPublisher(this.client).publish({
			id: ticket.id,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version,
		});

		msg.ack();
	}
}
