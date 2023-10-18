import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
	return currentUser ? (
		<div>You're signed in</div>
	) : (
		<div>You aren't signed in</div>
	);
};

LandingPage.getInitialProps = async context => {
	const client = buildClient(context);
	const { data } = await client.get("/api/users/currentuser");
	console.log(data);
	return data;
};

export default LandingPage;
