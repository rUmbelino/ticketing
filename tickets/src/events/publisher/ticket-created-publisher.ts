import { Publisher, Subjects, TicketCreatedEvent } from "@ru-tickets/common";

export class TicektCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
