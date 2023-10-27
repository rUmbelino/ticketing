import { PaymentCreatedEvent, Publisher, Subjects } from '@ru-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
