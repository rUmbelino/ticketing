import supertest from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';

it('marks an order as cancelled', async () => {
	const ticket = Ticket.build({
		title: 'test',
		price: 23,
	});
	await ticket.save();

	const user = global.signin();
	const { body: order } = await supertest(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await supertest(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it.todo('test delete an order that doesnt belong to authenticated user');

it.todo('emits an order cancelled event');
