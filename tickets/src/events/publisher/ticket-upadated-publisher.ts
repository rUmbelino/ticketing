import { Publisher, Subjects, TicketUpdatedEvent } from "@ru-tickets/common";

export class TicektUpdaterPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
