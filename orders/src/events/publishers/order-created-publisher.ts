import { Publisher, OrderCreated, Subjects } from '@ru-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreated> {
	readonly subject = Subjects.OrderCreated;
}
