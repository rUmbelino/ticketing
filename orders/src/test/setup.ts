import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wrapper');

declare global {
	var signin: () => string[];
}

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'asdkasldkqjwlkj';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	if (mongo) {
		await mongo.stop();
	}

	await mongoose.connection.close();
});

global.signin = () => {
	const token = jwt.sign(
		{
			id: new mongoose.Types.ObjectId().toHexString(),
			email: 'test@test.com',
		},
		process.env.JWT_KEY!
	);

	const sessionJSON = JSON.stringify({ jwt: token });
	const base64 = Buffer.from(sessionJSON).toString('base64');
	return [`session=${base64}`];
};
