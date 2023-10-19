import { currentUser, errorHandler, NotFoundError } from '@ru-tickets/common';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import expres from 'express';
import 'express-async-errors';

import { indexOrderRouter } from './routes';
import { createOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';

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
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(createOrderRouter);

app.all('*', (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);

export { app };
