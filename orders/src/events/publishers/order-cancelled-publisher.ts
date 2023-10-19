import { OrderCancelledEvent, Publisher, Subjects } from '@ru-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
