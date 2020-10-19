const config = require('../../config.js')
const {sign}=require('./auth')

async function auth(user,password){
    //si las credenciales coinciden con las ya definidas en archivo config:
    if (user===config.adminUser && password===config.adminPassword) {
        const token= sign({user,password})//genero el token
        return token
    }else{
        throw new Error('Login invalido')
    }
}

module.exports={auth};