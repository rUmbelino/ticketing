import { Listener, OrderCancelledEvent, Subjects } from '@ru-tickets/common';
import { TICKETS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicektUpdaterPublisher } from '../publisher/ticket-upadated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = TICKETS_SERVICE_QUEUE_GROUP;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) {
			throw new Error('ticket not found');
		}

		ticket.set({ orderId: undefined });
		await ticket.save();

		await new TicektUpdaterPublisher(this.client).publish({
			id: ticket.id,
			orderId: ticket.orderId,
			userId: ticket.userId,
			price: ticket.price,
			title: ticket.title,
			version: ticket.version,
		});

		msg.ack();
	}
}
