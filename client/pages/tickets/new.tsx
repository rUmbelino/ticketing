import { useState } from 'react';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const NewTicket = () => {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');

	const { doRequest, errors } = useRequest({
		url: '/api/tickets',
		method: 'post',
		body: { title, price },
		onSuccess: () => Router.push('/'),
	});

	const onBlur = () => {
		const value = parseFloat(price);
		if (isNaN(value)) {
			return;
		}

		setPrice(value.toFixed(2));
	};

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		doRequest();
	};

	return (
		<div>
			<h1>Create a Ticket</h1>
			<form onSubmit={onSubmit}>
				<div className="form-group">
					<label>Title</label>
					<input
						className="form-control"
						name="title"
						type="text"
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				</div>
				<br />
				<div className="form-group">
					<label>Price</label>
					<input
						className="form-control"
						name="price"
						type="text"
						value={price}
						onBlur={onBlur}
						onChange={e => setPrice(e.target.value)}
					/>
				</div>
				{errors}
				<div className="d-flex">
					<button className="btn btn-primary mt-3 m-auto w-25">Submit</button>
				</div>
			</form>
		</div>
	);
};

export default NewTicket;
