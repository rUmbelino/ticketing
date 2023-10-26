import { Publisher, OrderCreatedEvent, Subjects } from '@ru-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
