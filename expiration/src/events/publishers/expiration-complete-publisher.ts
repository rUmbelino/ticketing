import { ExpirationCompleteEvent, Publisher, Subjects } from '@ru-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
