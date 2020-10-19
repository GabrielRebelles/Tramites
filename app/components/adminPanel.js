import React from "react";
import AdminLogin from './adminLogin'
import Home from '../app'


class AdminPanel extends React.Component {
	constructor() {
		super();

		this.state = {
            viajes:[],
			desde: "",
			hasta: "",
			cliente: "",
			fecha: "",
			logOut:'',
			Home:'',
			_id:'',
			demora: "",
			comentario: "",
			valor: "",
			lluvia:undefined
		};
		
		this.demoraHsMin=''

		this.handleChange = this.handleChange.bind(this);
		this.subirViaje = this.subirViaje.bind(this);
		this.eliminarViaje = this.eliminarViaje.bind(this);
		this.traerViajes = this.traerViajes.bind(this);
		this.logOut = this.logOut.bind(this);
	}

	logOut(){
		//elimina la sesion dentro del local storage y te envia al panel de login
		localStorage.clear();
		this.setState({logOut:<AdminLogin><AdminPanel viajes={this.state.viajes || this.props.viajes}/></AdminLogin>})
	}
	
	subirViaje(event) {
		//solo se envia si tiene los campos obligatorios:
		if (this.state.cliente&&this.state.hasta) {

			let route="api/"
			let method="POST"
			
			//si tiene _id de mongo es porque va a actualizar algun dato:
			if (this.state._id.length==24) {
				route=`api/${this.state._id}`
				method='PUT'
			}

			fetch(location.origin+location.pathname+route, {
				method: method,
				body: JSON.stringify(this.state),
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					//las peticiones de create/update necesitan autorizacion
					authorization: "Bearer " + localStorage.getItem("JWT"),
				},
			})
			.then((res) => {
				//si envia un 401(no autorizado) se desloguea
				if(res.status===401)this.logOut()
				return res.json()
			})
			.then((res) => {

				//limpio el state:
				this.setState({ 
					desde: "", 
					hasta: "", 
					cliente: "", 
					fecha: "", 
					demora: "",
					comentario:"",
					valor:"",
					valorDemora:"",
					valorLluvia:"",
					lluvia:false,
					_id:""
				});

				//actualizo la lista de viajes
				this.traerViajes()

				//destildo el boton de lluvia
				let checks=document.getElementById('botonLluvia')
				if(checks&&(!!this.state.lluvia)!=checks.checked)checks.click()

				//agrego una clase de materializa a los inputs del form
				let inputs=document.getElementsByClassName('entrada')
				for(let i=0;i<inputs.length;i++){inputs[i].classList.add('keyboard-focused')}
			});
		}
		event.preventDefault();
	}

    eliminarViaje(id){
        console.log(id);
        fetch(location.origin+location.pathname+`api/${id}`, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				//las peticiones delete necesitan autorizacion
				'authorization': "Bearer " + localStorage.getItem("JWT"),
			}
		})
		.then((res) => {
			//si devuelve un no-autorizado es porque el token caduco
			if(res.status===401)this.logOut()
			this.traerViajes()
		})
	}
		
	traerViajes(){
		fetch(location.origin+location.pathname+'api')
		.then(res=>res.json())
		.then(data=>{
			data.map((viaje) => {
				if(viaje.demora){//acomodo el formato del tiempo a 'xhs ymin'
					let hs=Math.floor(viaje.demora/60)
					let min=viaje.demora%60
					viaje.demora= hs!==0?hs+'hs':'';
					viaje.demora+= min!==0?' '+min+'min':'';
				}
			})
			//invierto el array de viajes para que queden los mas nuevos arriba
			this.setState({viajes:data.reverse()})
		})
	}

	handleChange(event) {
		let texto=event.target.value
		//si es el primer caracter lo pongo en mayuscula:
		if(texto)texto=texto.replace(texto[0],texto[0].toUpperCase())
		this.setState({ [event.target.name]: texto });
    }
       
    componentDidMount(){
		//si hay viajes traidos de props los seteo en el state:
		if (this.props.viajes.length>0)this.setState({viajes:this.props.viajes})
		//si no los traigo del servidor:
		else this.traerViajes()
	}
	
	render() {
		if (this.state.logOut) return (<React.Fragment>{this.state.logOut}</React.Fragment>)
		if (this.state.Home) return (<React.Fragment>{this.state.Home}</React.Fragment>)

		
		let botonEditar=(viaje)=> {
			return (
				<button className="btn-small indigo lighten-2" href="#PrimerFila" 
				onClick={()=>{
					//limpio state y le asigno el viaje que voy a editar:
					this.setState({ 
						desde: "", 
						hasta: "", 
						cliente: "", 
						fecha: "", 
						demora: "",
						comentario:"",
						valor:"",
						valorDemora:"",
						valorLluvia:"",
						lluvia:false,
						_id:""
					});
					this.setState({...viaje})
					//asigno al boton de 'lluvia' su valor correspondiente
					let checks=document.getElementById('botonLluvia')
					if((!!viaje.lluvia)!=checks.checked)checks.click()
					//elimino la clase input-field(materialize) de los inputs del form
					let inputs=document.getElementsByClassName('entrada')
					for(let i=0;i<inputs.length;i++){inputs[i].classList.remove('input-field')}
					//para que lleve la pag hacia arriba:
					window.scroll(0, 0);
				}}>
				<i className="material-icons">edit</i></button>
			)}

		let botonEliminar=(viaje)=>{
			return <button 
				className="btn-small indigo lighten-2" 
				onClick={()=>{this.eliminarViaje(viaje._id)}}>
				<i className="material-icons">delete</i>
			</button>}



		return (
			<React.Fragment>
				<nav className="" style={{position:"fixed",zIndex:1020}} >
					<div className="container navbar-fixed">
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
				<main className="container" style={{paddingTop:"10ch",zIndex:1010}} >
					<form onSubmit={this.subirViaje} id="formulario">
						<div className="row">
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.desde}
									className="validate"
									type="text"
									name="desde"
									id="desde"
									onChange={this.handleChange}
								/>
								<label htmlFor="desde">Desde</label>
							</div>
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.hasta}
									className="validate"
									type="text"
									id="hasta"
									name="hasta"
									onChange={this.handleChange}
									/>
								<label htmlFor="hasta">Hasta*</label>
							</div>
						</div>
						<div className="row">
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.cliente}
									className="validate"
									type="text"
									name="cliente"
									autoComplete="organization"
									id="cliente"
									onChange={this.handleChange}
								/>
								<label htmlFor="cliente">Cliente*</label>
							</div>
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.fecha}
									className="validate"
									type="text"
									name="fecha"
									autoComplete="off"
									id="fecha"
									onChange={this.handleChange}
									/>
								<label htmlFor="fecha">Fecha</label>
							</div>
						</div>
						<div className="row">
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.demora==null?'':this.state.demora}
									className="validate"
									type="text"
									name="demora"
									autoComplete="off"
									id="demora"
									onChange={this.handleChange}
									/>
								<label htmlFor="demora">Demora</label>
							</div>
							<div className="input-field col s12 l6 entrada">
								<input
									value={this.state.valor}
									className="validate"
									type="number"
									name="valor"
									autoComplete="off"
									id="valor"
									onChange={this.handleChange}
									/>
								<label htmlFor="valor">Valor</label>
							</div>
						</div>
						<div className="row">
							<div className="input-field col s12 entrada">
								<input
									value={this.state.comentario}
									className="validate"
									type="text"
									name="comentario"
									id="comentario"
									autoComplete="off"
									onChange={this.handleChange}
									/>
								<label htmlFor="comentario">Comentario</label>
							</div>
						</div>						
						<div className="row">							
							<label>
								<input 
									type="checkbox" 
									id="botonLluvia" 
									className="filled-in" 
									onChange={(event)=>this.setState({lluvia:event.target.checked})}/>
								<span>Lluvia</span>
							</label>							
							<button className="btn right indigo lighten-2" type="submit" value="Enviar">Enviar</button>
							<button className="btn col push-s6 push-m8 push-l9 indigo lighten-2" onClick={()=>{
								//limpio el state:
								this.setState({ 
									desde: "", 
									hasta: "", 
									cliente: "", 
									fecha: "", 
									demora: "",
									valor:"",
									_id:"",
									comentario:"",
									lluvia:false
								})
								//desmarco el boton de lluvia
								let checks=document.getElementById('botonLluvia')
								if(checks.checked==true)checks.click()
								}}>Limpiar</button>
						</div>
					</form>					
					<table style={{fontSize:"86%"}}>
						<thead>
							<tr>
								<th>Desde</th>
								<th>Hasta</th>
								<th>Cliente</th>
								<th>Fecha</th>
								<th>Valor</th>
								<th>Demora</th>
								<th className="hide-on-med-and-up" >Admin</th>
								<th className="hide-on-small-only" >Eliminar</th>
								<th className="hide-on-small-only" >Editar</th>
							</tr>							
						</thead>
						<tbody className="">
							{this.state.viajes.map((viaje) => {
								let valor=(viaje.valor||0)+(viaje.valorDemora || 0)+(viaje.valorLluvia||0)
								valor=valor==0?'':'$'+valor;
								return (
									<tr key={viaje._id}>
										<td style={{maxWidth: "8ch",width:"8ch",wordWrap:"break-word"}}>{viaje.desde}</td>
										<td style={{maxWidth: "8ch",width:"8ch",wordWrap:"break-word"}}>{viaje.hasta}</td>
										<td style={{maxWidth: "8ch",width:"8ch",wordWrap:"break-word"}}>{viaje.cliente}</td>
										<td>{viaje.fecha}</td>
										<td>{valor}</td>
										<td>{viaje.demora}</td>
										<td className="hide-on-med-and-up">{botonEliminar(viaje)}<br/><br/>{botonEditar(viaje)}</td>
										<td className="hide-on-small-only" >{botonEliminar(viaje)}</td>
										<td className="hide-on-small-only">{botonEditar(viaje)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>					
				</main>
				<footer className="page-footer grey lighten-4" >
					<div className="container">
						<button className="btn right indigo lighten-2" onClick={this.logOut} style={{marginBottom:"5ch"}}>Cerrar Sesion</button>
						<br/>
					</div>
				</footer>
            </React.Fragment>
		);
	}
}

export default AdminPanel;
