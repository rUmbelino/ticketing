import { FC, FormEvent, useState } from "react";
import Router from "next/router";
import useRequest from "../hooks/useRequest";

interface SignFormArgs {
	url: string;
	title: string;
}

const SignForm: FC<SignFormArgs> = ({ url, title }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { errors, doRequest } = useRequest({
		url,
		method: "post",
		body: {
			email,
			password,
		},
		onSuccess: () => {
			Router.push("/");
		},
	});

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		doRequest();
	};

	return (
		<form onSubmit={onSubmit} className="p-3">
			<h1>{title}</h1>
			<div className="form-group">
				<label className="py-2">Email Address</label>
				<input
					value={email}
					onChange={e => setEmail(e.target.value)}
					className="form-control"
				/>
			</div>
			<div className="form-group">
				<label className="py-2">Password</label>
				<input
					value={password}
					onChange={e => setPassword(e.target.value)}
					className="form-control"
					type="password"
				/>
			</div>
			{errors}
			<button className="btn btn-primary d-flex m-auto my-3">{title}</button>
		</form>
	);
};

export default SignForm;
