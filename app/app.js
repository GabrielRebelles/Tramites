import React from "react";
import Admin from './admin'

class App extends React.Component {
	constructor() {
		super();
		this.state = {
            viajes: [],
			tablaViajes:'',
			goToAdmin:null,
			modalOpen:false,
			listaClientes:[],
			peticionClientes:[]
		};
        
		this.peticion = this.peticion.bind(this);
		this.generarTabla = this.generarTabla.bind(this);
		this.modalTags = this.modalTags.bind(this);
		this.changeCheckbox = this.changeCheckbox.bind(this);
	}

	peticion() {
        
		return fetch(location.origin+location.pathname+`api/`)
			.then((res) => res.json())
			.then((data) => {
				data.reverse().map((viaje) => {
					if(viaje.demora){//acomodo el formato del tiempo a 'xhs ymin'
						let hs=Math.floor(viaje.demora/60)
						let min=viaje.demora%60
						viaje.demora= hs!==0?hs+'hs':'';
						viaje.demora+= min!==0?' '+min+'min':'';
					}
				})
                this.setState({ viajes: data});
                this.generarTabla();
			}) //retorna data
	}

	componentDidMount() {
		this.peticion()
		if(localStorage.getItem("JWT")){
			fetch(location.origin+location.pathname+`api/token`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					'authorization': "Bearer " + localStorage.getItem("JWT"),
				}
			})
			.then((res) => {
				if(res.status===401)localStorage.clear();
			})
		}

    }
	
	changeCheckbox(event){
		let arr=this.state.peticionClientes		
		
		if(event.target.checked){
			arr.push(event.target.name)
		}else{
			arr.splice(arr.indexOf(event.target.name),1)
		}
		this.setState({peticionClientes:arr})
	}

	modalTags(){

		let modal= (
		<React.Fragment>
		<div className={this.state.modalOpen?"modal":"hide"} tabIndex="0" style={{zIndex: 1003, display: "block", opacity: 1, top: "10%", transform: "scaleX(1) scaleY(1)"}}>
			<div className="container">
				<h5>Cliente:</h5>
				<div className="" style={{marginTop:"3ch"}}>
					{
					this.state.listaClientes.map((cliente)=>{
						return (
						<p key={cliente}>
							<label>
								<input name={cliente} type="checkbox" className="filled-in"  onChange={this.changeCheckbox} />
								<span>{cliente}</span>
							</label>
						</p>
						)
					})}
					
				</div>
				<div className="">
					<button className="btn left indigo lighten-2" onClick={()=>{this.setState({modalOpen:false})}} style={{marginBottom:"3ch"}} >Cancelar</button>
					<button className="btn right indigo lighten-2" onClick={()=>{location.href=location.origin+location.pathname+`api/excel?clientes=${this.state.peticionClientes}`}} style={{marginBottom:"3ch"}} >Exportar</button>
				</div>
			</div>
		</div>
		<div className={this.state.modalOpen?"modal-overlay":"hide"} onClick={()=>{this.setState({modalOpen:false})}} style={{zIndex: 1002, display: "block", opacity: 0.5}}></div>
		</React.Fragment>)

		return modal
	}
	
    generarTabla(){
		let first=true
		let exportarExcel=()=> {
			this.setState({modalOpen:true})
			if(first){
				let checks=document.getElementsByClassName("filled-in")
				for (const check of checks)check.click()
				first=false
			}
		}

		//genero la lista para el modal
		let arr=this.state.viajes.map((viaje)=>viaje.cliente).filter((element,index,arr)=>{return arr.indexOf(element)===index})
		this.setState({listaClientes:arr})

        let tablaViajes;
		if (this.state.viajes.length > 0) {
			tablaViajes=(
			<React.Fragment>
				<table className="highlight" >
					<thead>
						<tr>
							<th>Desde</th>
							<th>Hasta</th>
							<th>Cliente</th>
							<th>Fecha</th>
							<th>Demora</th>
						</tr>
					</thead>
					<tbody>
						{this.state.viajes.map((viaje) => {
							return (
								<tr key={viaje._id}>
									<td style={{maxWidth: "10ch",width:"10ch",wordWrap:"break-word"}}>{viaje.desde}</td>
									<td style={{maxWidth: "10ch",width:"10ch",wordWrap:"break-word"}}>{viaje.hasta}</td>
									<td style={{maxWidth: "10ch",width:"10ch",wordWrap:"break-word"}}>{viaje.cliente}</td>
									<td style={{maxWidth: "10ch",width:"10ch",wordWrap:"break-word"}}>{viaje.fecha}</td>
									<td style={{maxWidth: "10ch",width:"10ch",wordWrap:"break-word"}}>{viaje.demora}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<br/>
				<button className="btn right indigo lighten-2" onClick={exportarExcel} style={{marginBottom:"3ch"}}>Exportar Excel</button>
			</React.Fragment>
			
			)
		}else{
			tablaViajes=(
				<h6 className="center" >Aun no existen viajes para mostrar</h6>
			)
		}

		this.setState({tablaViajes:tablaViajes})
	}
	

	render() {
		if (this.state.goToAdmin) {//Voy al Admin
        return <Admin viajes={this.state.viajes}></Admin>
		}

		let circuloCarga=
		<div className="center" >
			<div className="preloader-wrapper big active center">
				<div className="spinner-layer spinner-blue-only">
					<div className="circle-clipper left">
						<div className="circle"></div>
					</div>
					<div className="gap-patch">
						<div className="circle"></div>
					</div>
					<div className="circle-clipper right">
						<div className="circle"></div>
					</div>
				</div>
			</div>
		</div>
		
		return (
			<React.Fragment>
				<nav className="" style={{position:"fixed"}}>
					<div className="container nav-wrapper " >
						<a href="#" className="brand-logo" >
							<div style={{lineHeight:"80px"}}>
								<img width="120px" className="hide-on-med-and-up" src="./Logo.png" alt="Logo"/>
								<img width="140px" className="hide-on-med-and-down" src="./Logo.png" alt="Logo"/>
							</div>
						</a>
						<ul id="nav-mobile" className="right">
							<li><a onClick={()=>{this.setState({goToAdmin:true})}}>Admin</a></li>
						</ul>
					</div>
				</nav>
				<div className="container" style={{paddingTop:"7ch"}} >
					<br/>
					{this.state.tablaViajes||circuloCarga}
					<br/>
					{this.modalTags()}
				</div>
			</React.Fragment>
		);
	}
}

export default App;
