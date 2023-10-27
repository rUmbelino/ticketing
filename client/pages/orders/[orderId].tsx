import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);

	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push('/orders'),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);
		return () => clearInterval(timerId);
	}, [order]);

	if (timeLeft < 0) {
		return <div>Order expired!</div>;
	}

	return (
		<div>
			<h3>Time left to pay: {timeLeft} seconds</h3>
			<StripeCheckout
				email={currentUser.email}
				amount={order.ticket.price * 100}
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_1xPu6bMH0Qk8DRIhIyavBI5j00PywNegdb"
			/>
			{errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data: order } = await client.get(`/api/orders/${orderId}`);

	return { order };
};

export default OrderShow;
