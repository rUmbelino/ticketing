import "express-async-errors";
import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI must be defined");
	}

	if (!process.env.JWT_KEY) {
		throw new Error("JWT_KEY must be defined");
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("connected to MongoDB");
	} catch (err) {
		console.log(err);
	}

	app.listen(3000, () => console.log("listening at port 3000"));
};

start();
