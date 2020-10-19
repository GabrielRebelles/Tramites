import React from 'react'
import Home from '../app'

class AdminLogin extends React.Component{

    constructor(){
        super()
        this.state={
			children:'',
			Home:''
        }
        this.handleChange=this.handleChange.bind(this)
		this.login=this.login.bind(this)
    }

    login(event){
		fetch(location.origin+location.pathname+'api/auth',{
			method: 'POST',         
			body:JSON.stringify(this.state),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		})
		.then(res=>{
			return res.json()
		})
		.then((res)=>{
			document.getElementById('parrafoLogin').innerHTML=res.error||''
			if (res && res.token){
                localStorage.setItem('JWT',res.token);
                this.setState({children:this.props.children})
            }
		})
		.catch((err)=>{
			//solo se puede rechazar por fallo de red o algo impide la solicitud
			console.log(err)
		})
		event.preventDefault()//para que no se reinicie la pag
    }
    
    handleChange(event){
		const {name,value}=event.target
		this.setState({[name]:value})
	}

    render() {
        if (this.state.children) {
            return this.props.children
		}
		if (this.state.Home) return (<React.Fragment>{this.state.Home}</React.Fragment>)
		return (
			<React.Fragment>
				<nav className="" style={{display:"flow"}} >
					<div className="container navbar-fixed ">
						<a href="#" className="brand-logo">
							<div style={{lineHeight:"80px"}}>
								<img width="120px" className="hide-on-med-and-up" src="./Logo.png" alt="Logo"/>
								<img width="140px" className="hide-on-med-and-down" src="./Logo.png" alt="Logo"/>
							</div>
						</a>
						<ul id="nav-mobile" className="right">
							<li><a onClick={()=>{this.setState({Home:<Home></Home>})}}>Home</a></li>
						</ul>
					</div>
				</nav>
				
				<div className="row">
					<div className="col s12 m4 offset-m4">

						<div className="card">
							<div className="card-action indigo lighten-2 white-text">
								<h3>Login</h3>
							</div>
							<div className="card-content">
							<form onSubmit={this.login}>

								<div className="form-field">
									<label htmlFor="username">Username</label>
									<input type="text" name="username" id="username" onChange={this.handleChange}/>
								</div>
								<div className="form-field">
									<label htmlFor="password">Password</label>
									<input type="password" name="password" id="password" onChange={this.handleChange}/>
								</div>
								<div className="form-field">
									<p className="red-text darken-4" id="parrafoLogin"></p><br/>
									<button type="submit" className=" indigo lighten-2 btn-large waves-effect" style={{width:'100%'}} >Login</button>
								</div>
							</form>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default AdminLogin;