import axios from 'axios';
import { useState } from 'react';

interface UseRequestArgs {
	url: string;
	method: 'post' | 'get' | 'delete' | 'put';
	body: any;
	onSuccess?: (data: any) => void;
}

export default ({ url, method, body, onSuccess }: UseRequestArgs) => {
	const [errors, setErrors] = useState(null);

	const doRequest = async (props = {}) => {
		try {
			setErrors(null);
			const response = await axios[method](url, { ...body, ...props });

			if (onSuccess) {
				onSuccess(response.data);
			}

			return response.data;
		} catch (err) {
			setErrors(
				<div className="alert alert-danger my-3">
					<h4>Ooops...</h4>
					<ul className="my-0">
						{err.response.data.errors.map(({ message }) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				</div>
			);
		}
	};

	return {
		errors,
		doRequest,
	};
};
