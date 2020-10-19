const model = require('./model')

class Viajes {

    async listarViajes(filter,id){
        if (id) return await model.findById(id)
        else return await model.find(filter)
    }
    async agregarViaje(viaje){
        if(!viaje){throw new Error('Viaje inexistente')}
        const nuevoViaje= new model(viaje)
        await nuevoViaje.save()
        return nuevoViaje
    }
    async eliminarViaje(id){
        if(!id){throw new Error('Viaje inexistente')}
        return await model.findByIdAndRemove(id)
    }
    async actualizarViaje(id,viaje){
        if(!id){throw new Error('Id no enviado')}
        if(!viaje){throw new Error('Viaje no enviado')}
        await model.findByIdAndUpdate(id,viaje,{useFindAndModify:false})
        return await this.listarViajes()
    }
}


module.exports = Viajes