import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns error if ticket does not exist', async () => {
	const ticketId = new mongoose.Types.ObjectId();
	await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId }).expect(404);
});

it('returns error if ticket is already reserved', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 15,
		id: new mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: '1231231',
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
});

it('reservs a ticket', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 15,
		id: new mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

	await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);
});

it('emits an order created event', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 15,
		id: new mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

	await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
