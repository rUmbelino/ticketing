import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});
	await ticket.save();

	const firstInstance = await Ticket.findById(ticket.id);
	const secoundInstance = await Ticket.findById(ticket.id);

	firstInstance!.set({ price: 10 });
	secoundInstance!.set({ price: 15 });

	await firstInstance!.save();
	try {
		await secoundInstance!.save();
	} catch (err) {
		return;
	}

	throw new Error('Should not reach this point!');
});

it('increaments the version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});
	await ticket.save();

	expect(ticket.version).toBe(0);
	await ticket.save();
	expect(ticket.version).toBe(1);
	await ticket.save();
	expect(ticket.version).toBe(2);
});
