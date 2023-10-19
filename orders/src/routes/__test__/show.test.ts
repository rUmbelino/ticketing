import supertest from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';

it('fetches the order', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 4.29,
	});
	await ticket.save();

	const cookie = global.signin();
	const { body: order } = await supertest(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchOrder } = await supertest(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(fetchOrder.id).toEqual(order.id);
});

it('returns error when tryes to fetch another users order', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 4.29,
	});
	await ticket.save();

	const { body: order } = await supertest(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	await supertest(app).get(`/api/orders/${order.id}`).set('Cookie', global.signin()).send().expect(401);
});
