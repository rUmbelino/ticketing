import { ExpirationCompleteEvent, Subjects } from '@ru-tickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 25,
	});
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return {
		listener,
		ticket,
		order,
		data,
		msg,
	};
};

it('updates order status to cancelled', async () => {
	const { listener, order, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
	const { listener, ticket, order, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenLastCalledWith(
		Subjects.OrderCancelled,
		JSON.stringify({
			id: order.id,
			version: order.version + 1,
			ticket: {
				id: ticket.id,
			},
		}),
		expect.any(Function)
	);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
