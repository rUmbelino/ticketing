import { Listener, Subjects, TicketCreatedEvent } from '@ru-tickets/common';
import { Message } from 'node-nats-streaming';
import { ORDERS_SERVICE_QUEUE_GROUP } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	queueGroupName = ORDERS_SERVICE_QUEUE_GROUP;

	async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		const { id, title, price } = data;
		const ticket = Ticket.build({ id, title, price });
		await ticket.save();

		msg.ack();
	}
}
