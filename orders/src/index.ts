import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}

	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}

	if (!process.env.NATS_CLUSETER_ID) {
		throw new Error('NATS_CLUSETER_ID must be defined');
	}

	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}

	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}

	try {
		natsWrapper.connect('ticketing', 'alsdadas', 'http://nats-srv:4222');

		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed!');
			process.exit();
		});

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		await mongoose.connect(process.env.MONGO_URI);
		console.log('connected to MongoDB');
	} catch (err) {
		console.log(err);
	}

	app.listen(3000, () => console.log('listening at port 3000'));
};

start();