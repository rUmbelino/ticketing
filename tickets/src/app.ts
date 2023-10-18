import { currentUser, errorHandler, NotFoundError } from "@ru-tickets/common";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import expres from "express";
import "express-async-errors";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = expres();
app.set("trust proxy", true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== "test",
	})
);

app.use(currentUser);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
app.use(createTicketRouter);

app.all("*", (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);

export { app };
