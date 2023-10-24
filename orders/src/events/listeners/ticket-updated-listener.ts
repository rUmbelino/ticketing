import { Listener, Subjects, TicketUpdatedEvent } from '@ru-tickets/common';
import { Message } from 'node-nats-streaming';
import { ORDERS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = ORDERS_SERVICE_QUEUE_GROUP;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		const ticket = await Ticket.findByEvent(data);
		if (!ticket) {
			throw new Error('Ticket not found');
		}

		const { title, price } = data;
		ticket.set({ title, price });
		await ticket.save();

		msg.ack();
	}
}
