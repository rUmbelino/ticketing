import { currentUser, errorHandler, NotFoundError } from '@ru-tickets/common';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import expres from 'express';
import 'express-async-errors';
import { createChargeRouter } from './routes/new';

const app = expres();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);

app.use(currentUser);
app.use(createChargeRouter);

app.all('*', (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);

export { app };
