import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListner extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	queueGroupName = "payments-service";

	onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
		console.log("event data: ", data);
		msg.ack();
	}
}
