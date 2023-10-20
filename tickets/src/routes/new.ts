import { requireAuth, validateRequest } from '@ru-tickets/common';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { TicektCreatedPublisher } from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/tickets',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then zero'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;
		const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
		await ticket.save();

		await new TicektCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
		});

		res.status(201).send(ticket);
	}
);

export { router as createTicketRouter };
