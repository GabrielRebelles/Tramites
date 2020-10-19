import React from "react";
import AdminLogin from './components/adminLogin'
import AdminPanel from './components/adminPanel'

class Home extends React.Component {
	constructor(){
		super();
	}

	render() {
		if (localStorage.getItem('JWT')) {
			return (
				<React.Fragment>
					<AdminPanel viajes={this.props.viajes}></AdminPanel>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
                <AdminLogin><AdminPanel viajes={this.props.viajes}/></AdminLogin>
			</React.Fragment>
		);
	}
}

export default Home;
