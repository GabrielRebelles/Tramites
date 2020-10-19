const jwt=require('jsonwebtoken')
const { jwtSecreto,adminUser } = require('../../config')

function sign(data){
    //evito que se envie la password dentro del token:
    delete data.password    
    //creo la session:
    return jwt.sign(data,jwtSecreto,{ expiresIn: 1800 })
}

async function logeado(req){//si hay algun error se interrumpe la ejecucion de la func
    const autorizacion = req.headers.authorization || "";
    //limpia el token:
    const token = getToken(autorizacion);
    //verifica y decodifica:
    const tokenDecodificado = jwt.verify(token, jwtSecreto);
    //verifico si el usuario dentro del token es el correcto
    if(tokenDecodificado.user!==adminUser)throw new Error('Token valido pero usuario no')
    return tokenDecodificado
}

function getToken(auth){
    if (!auth) {
		throw new Error('No se encontro el token')
	}
	if (auth.indexOf("Bearer ") === -1) {
		throw new Error('Formato de token invalido')
    }
	return auth.replace("Bearer ", "");
}


module.exports={sign,logeado}