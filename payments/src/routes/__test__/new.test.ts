import supertest from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@ru-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns 404 when purchasing an order that does not exists', async () => {
	await supertest(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: '123123',
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('returns 401 when purchasing an order that does not belongs to the user', async () => {
	const order = await Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
	});
	await order.save();

	await supertest(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: '123123',
			orderId: order.id,
		})
		.expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = await Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Cancelled,
		userId,
		version: 0,
	});
	await order.save();

	await supertest(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: '123123',
			orderId: order.id,
		})
		.expect(400);
});

it('returns a 201 with valid inputs', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = await Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Created,
		userId,
		version: 0,
	});
	await order.save();

	await supertest(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201);

	const payment = await Payment.findOne({
		orderId: order.id,
	});
	expect(payment).not.toBeNull();

	expect(stripe.charges.create).toHaveBeenCalledWith({
		amount: 1000,
		currency: 'usd',
		source: 'tok_visa',
	});
});
