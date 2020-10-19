const express = require("express");
const router = express.Router();
const moment = require("moment");
const Controller = require("./controller");
const controller = new Controller();
const excel = require("excel4node");
const secure = require("./secure");

const precioMinuto=3.333333333;

//Defino endpoints
router.get("/",listarViajes);
router.get("/excel",exportarExcel);
router.get("/:id",listarViajes);
router.post("/", secure(),nuevoViaje);
router.delete("/:id", secure(),eliminarViaje);
router.put("/:id", secure(),editarViaje);
router.post("/token", secure());


async function listarViajes(req, res, next) {
	controller.listarViajes(req.body,req.params.id).then((viajes) => {
		res.json(viajes);
	});
}
async function exportarExcel(req, res, next) {
	//llegan los tags por query separados por comas, los convierto en un array:
	const arrayClientes=req.query.clientes.split(',')
	//traigo la lista de viajes que coincidan con el filtro:
	const Ids = await controller.listarViajes({cliente:arrayClientes});
	const workBook = new excel.Workbook();//creo un nuevo Book
	const workSheet = workBook.addWorksheet("Viajes");//agrego una hoja con nombre 'viajes'

	//defino estilo:
	const style = workBook.createStyle({
		font: { size: 16 },
		alignment: { horizontal: "center",vertical: "center", wrapText:true },
    });
	
	//defino todas las columnas con su ancho
	workSheet.column(1).setWidth(30);
	workSheet.column(2).setWidth(30);
	workSheet.column(3).setWidth(30);
	workSheet.column(4).setWidth(16);
	workSheet.column(5).setWidth(16);
	workSheet.column(6).setWidth(16);
	workSheet.column(7).setWidth(16);
	workSheet.column(8).setWidth(16);
	workSheet.column(9).setWidth(16);
	workSheet.column(10).setWidth(30);
	//congelo la primer fila(funciona como "Header" de la tabla):
	workSheet.row(1).freeze();
	//defino cada campo del Header:
	workSheet.cell(1, 1).string("Desde:").style(style);
	workSheet.cell(1, 2).string("Hasta:").style(style);
	workSheet.cell(1, 3).string("Cliente:").style(style);
	workSheet.cell(1, 4).string("Fecha:").style(style);
	workSheet.cell(1, 5).string("Demora:").style(style);
	workSheet.cell(1, 6).string("Valor:").style(style);
	workSheet.cell(1, 7).string("Valor viaje").style(style);
	workSheet.cell(1, 8).string("Valor demora").style(style);
	workSheet.cell(1, 9).string("Valor lluvia").style(style);
	workSheet.cell(1, 10).string("Comentario:").style(style);
	
	let gananciaTotal=0

	//recorro la lista de viajes que coincidieron con el filtro
	Ids.forEach((viaje, index) => {
		let demora
		if(viaje.demora){//acomodo el formato del tiempo a 'xhs ymin'
			let hs=Math.floor(viaje.demora/60)
			let min=viaje.demora%60
			demora= hs!==0?hs+'hs':'';
			demora+= min!==0?' '+min+'min':'';
		}

		//calculo el valor total del viaje:
		let valorTotal=(viaje.valor||0)+(viaje.valorDemora || 0)+(viaje.valorLluvia||0)
		//acumulo los valores para calcular el total de los viajes
		gananciaTotal+=valorTotal;
		//lo paso a un string con el signo '$' antepuesto
		valorTotal=valorTotal==0?'':'$'+valorTotal;

		//arranco a partir de la fila 3:
		let fila = index + 3;
		//en cada iteracion lleno una fila entera:
		workSheet.cell(fila, 1).string(viaje.desde).style(style);
		workSheet.cell(fila, 2).string(viaje.hasta).style(style);
		workSheet.cell(fila, 3).string(viaje.cliente).style(style);
		workSheet.cell(fila, 4).string(viaje.fecha).style(style);
		workSheet.cell(fila, 5).string(demora?demora.toString():'').style(style);
		workSheet.cell(fila, 6).string(valorTotal).style(style);
		workSheet.cell(fila, 7).number(parseInt(viaje.valor)||0).style(style);
		workSheet.cell(fila, 8).number(parseInt(viaje.valorDemora)||0).style(style);
		workSheet.cell(fila, 9).number(parseInt(viaje.valorLluvia)||0).style(style);
		workSheet.cell(fila, 10).string(viaje.comentario).style(style);
	});

	//lleno el campo del total
	workSheet.cell(Ids.length+4, 6).string('Total: $'+gananciaTotal).style(style);

	//defino grupo de columnas que va a estar oculto hasta que se abra el grupo
	workSheet.column(7).group(1, true);
	workSheet.column(8).group(1, true);
	workSheet.column(9).group(1, true);

	//si el filtro tiene un solo cliente, lo escribo en el nombre del archivo
	let nombreCliente=arrayClientes.length==1?' - '+arrayClientes[0]:'';
	//respondo con el archivo:
	let nombre ='Viajes al '+ moment().utcOffset(-180).format("DD-MM")+nombreCliente+'.xlsx';
	workBook.write(nombre, res);//respondo con el archivo
}
async function nuevoViaje(req, res, next) {
	//si viene sin fecha le asigno la fecha de hoy:
	if (!req.body.fecha) req.body.fecha = moment().utcOffset(-180).format("DD/MM");
	//si viene el _id lo elimino para evitar problemas con Mongo
	if(typeof req.body._id === 'string') delete req.body._id;
	
	acomodarViaje(req)
	const viaje = await controller.agregarViaje(req.body);
	res.status(201).json(viaje);//devuelvo el nuevo viaje
}
async function eliminarViaje(req, res, next) {
	const idViaje = req.params.id;
	controller
		.eliminarViaje(idViaje)
		.then(() => {
			res.status(201).json("Viaje eliminado");
		})
		.catch(() => {
			res.status(201).json("Viaje no encontrado");
		});
}
async function editarViaje(req, res, next) {
	acomodarViaje(req,true)
	const viaje = req.body;
	const idViaje = req.params.id;
	const edit = await controller.actualizarViaje(idViaje, viaje);
	res.status(201).json(edit);
}

function acomodarViaje(req,editar){
	let min=0

	//req.body.demora tiene valores como '2hs 30 min', el algoritmo lo convierte a minutos
	if(req.body.demora){
		//convierto la demora(string) a un array de caracteres eliminando espacios:
		let dem=req.body.demora.split('').filter(char=>char!==' ')

		//recorro el array de caracteres
		dem.forEach((element,index) => {

			//si el elemento es una 'h' o 'H'(de hora)
			if(element=='h'||element=='H'){
				//voy a la posicion anterior, y pregunto si no es un NaN(y por ende es un numero)
				//si es un numero lo multiplico po 60 y lo sumo al contador de minutos
				min+=!isNaN(dem[index-1])? parseInt(dem[index-1])*60:0;
				//lo mismo pero con decenas:
				min+=!isNaN(dem[index-2])? parseInt(dem[index-1])*600:0;
			}

			//mismo procedimiento pero con minutos:
			if(element=='m'||element=='M'){
				min+= !isNaN(dem[index-1])? parseInt(dem[index-1]):0;
				min+= !isNaN(dem[index-2])? parseInt(dem[index-2])*10:0;
			}
		});
		req.body.demora=min==0?'':min;
		req.body.valorDemora=Math.ceil(min*precioMinuto)
	}else{req.body.demora=undefined}

	if (req.body.valor) {//si existe lo paso a Int
		req.body.valor=parseInt(req.body.valor)
		//si (lluvia==true) le asigno el 40% del valor
		req.body.valorLluvia=req.body.lluvia?req.body.valor*0.4:0;
	}else{req.body.valor=0}

}


module.exports = router;
