import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
	console.log('starting up...');

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}

	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('connected to MongoDB');
		app.listen(3000, () => console.log('listening at port 3000!'));
	} catch (err) {
		console.error('====== ERROR STARTING APP ======');
		console.log(err);
	}
};

start();
