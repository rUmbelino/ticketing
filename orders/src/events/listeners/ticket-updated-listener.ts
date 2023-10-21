import { Listener, Subjects, TicketUpdatedEvent } from '@ru-tickets/common';
import { Message } from 'node-nats-streaming';
import { ORDERS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = ORDERS_SERVICE_QUEUE_GROUP;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		const { id, title, price, version } = data;
		const ticket = await Ticket.findOne({ _id: id, version: version - 1 });

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		ticket.set({ title, price });
		await ticket.save();

		msg.ack();
	}
}
