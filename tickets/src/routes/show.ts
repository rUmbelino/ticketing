import { Request, Response, Router } from "express";
import { Ticket } from "../models/ticket";
import { NotFoundError } from "@ru-tickets/common";

const router = Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
	const ticket = await Ticket.findById(req.params.id);
	if (!ticket) {
		throw new NotFoundError();
	}

	res.send(ticket);
});

export { router as showTicketRouter };
