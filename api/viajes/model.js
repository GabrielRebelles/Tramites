//defino el esquema de como van a ser los datos en mongo
const mongoose = require('mongoose')
const esquema=mongoose.Schema

const miEsquema= new esquema({
    desde:{type: String},
    hasta:{type: String, required: true},
    cliente:{type: String, required: true},
    fecha:{type: String, required: true},
    demora:{type: Number},
    valor:{type: Number},
    valorLluvia:{type: Number},
    valorDemora:{type: Number},
    lluvia:{type: Boolean},
    comentario:{type: String}
})

module.exports=mongoose.model('Viajes',miEsquema)