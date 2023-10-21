import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@ru-tickets/common';
import { Request, Response, Router } from 'express';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { TicektUpdaterPublisher } from '../events/publisher/ticket-upadated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('title is required'),
		body('price').isFloat({ gt: 0 }).withMessage('price greater then 0 is required'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		ticket.set({
			title: req.body.title,
			price: req.body.price,
		});

		await ticket.save();

		await new TicektUpdaterPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price.toString(),
			userId: ticket.userId,
			version: ticket.version,
		});

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
