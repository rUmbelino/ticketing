import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
	return (
		<div>
			<Header currentUser={currentUser} />
			<div className="container">
				<Component currentUser={currentUser} {...pageProps} />
			</div>
		</div>
	);
};

AppComponent.getInitialProps = async ({ ctx, Component }) => {
	const client = buildClient(ctx);
	const { data } = await client.get('/api/users/currentuser');

	let pageProps = {};
	if (Component.getInitialProps) {
		pageProps = await Component.getInitialProps(ctx, client, data.currentUser);
	}

	return {
		pageProps,
		currentUser: data.currentUser,
	};
};

export default AppComponent;
