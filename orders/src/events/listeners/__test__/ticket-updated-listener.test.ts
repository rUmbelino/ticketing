import { TicketUpdatedEvent } from '@ru-tickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';

const setup = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		title: 'concert',
		price: 10,
		id: new mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	const data: TicketUpdatedEvent['data'] = {
		version: ticket.version + 1,
		title: 'concert update',
		price: 55,
		id: ticket.id,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket };
};

it('finds, updates, and saves a ticket', async () => {
	const { listener, data, msg, ticket } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket?.title).toEqual(data.title);
	expect(updatedTicket?.price).toEqual(data.price);
	expect(updatedTicket?.version).toEqual(data.version);
});

it('ack the message', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('should not ack the message if event has skipped version number', async () => {
	const { listener, data, msg } = await setup();

	data.version = data.version + 1;

	try {
		await listener.onMessage(data, msg);
	} catch (err) {}

	expect(msg.ack).not.toHaveBeenCalled();
});
