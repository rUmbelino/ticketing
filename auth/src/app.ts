import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import expres from 'express';
import 'express-async-errors';

import { NotFoundError, errorHandler } from '@ru-tickets/common';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

const app = expres();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: false,
	})
);

app.use(signInRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(currentUserRouter);
app.all('*', (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);

export { app };
