import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
	const randomId = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${randomId}`)
		.set('Cookie', global.signin())
		.send({
			title: 'asdsa',
			price: 1,
		})
		.expect(404);
});

it('returns a 401 if the user is not authentic', async () => {
	const randomId = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${randomId}`)
		.send({
			title: 'asdsa',
			price: 1,
		})
		.expect(401);
});

it('returns a 401 if the user do not owns the ticket', async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.set('Cookie', global.signin())
		.send({
			title: 'test',
			price: 1,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'test 2',
			price: 100,
		})
		.expect(401);
});

it('returns a 400 if the user provides invalid title or price', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post(`/api/tickets/`)
		.set('Cookie', cookie)
		.send({
			title: 'test',
			price: 1,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 30,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'testtest',
			price: -100,
		})
		.expect(400);
});

it('updates the ticket provided valid inputs', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post(`/api/tickets/`)
		.set('Cookie', cookie)
		.send({
			title: 'test',
			price: 1,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 300,
		})
		.expect(200);

	const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

	expect(ticketResponse.body.title).toEqual('new title');
	expect(ticketResponse.body.price).toEqual(300);
});

it('publishes an event', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post(`/api/tickets/`)
		.set('Cookie', cookie)
		.send({
			title: 'test',
			price: 1,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 300,
		})
		.expect(200);

	await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
