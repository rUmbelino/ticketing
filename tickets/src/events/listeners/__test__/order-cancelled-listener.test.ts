import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-ticket';
import { OrderCancelledEvent } from '@ru-tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const ticket = Ticket.build({
		title: 'concert',
		price: 13,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});

	const orderId = new mongoose.Types.ObjectId().toHexString();
	ticket.set({ orderId });

	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { ticket, data, msg, listener };
};

it('updates the ticket', async () => {
	const { listener, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).toBeUndefined();
});

it('publish the event', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('acks the message', async () => {
	const { listener, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenLastCalledWith(
		'ticket:updated',
		JSON.stringify({
			id: ticket.id,
			userId: ticket.userId,
			price: ticket.price,
			title: ticket.title,
			version: ticket.version + 1,
		}),
		expect.any(Function)
	);
});
