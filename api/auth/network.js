const express=require('express')
const router=express.Router()
const controller=require('./controller')

router.post('/',(req,res,next)=>login(req,res,next))

let ips={}
let intentos={}

async function login(req,res,next) {

    //algoritmo para evitar fuerza bruta al login: 3 intentos cada 20seg
    let ahora=new Date().getTime()
    let segundos=1000*20
	intentos[req.ip]=intentos[req.ip]||0
    ips[req.ip]=ips[req.ip]||ahora    
 
    //si no paso xsegundos desde el primer login
    if(ips[req.ip]+segundos>=ahora){
        intentos[req.ip]++
    }else {
        intentos[req.ip]=0;
        ips[req.ip]=0
    }    
    if(intentos[req.ip]>3){
        res.status(401).send({
            error: 'Demasiados intentos, proba mas tarde',
            token:null
        })        
        return;
    }
    
    
    controller.auth(req.body.username,req.body.password)
    .then((token)=>{
        res.status(200).send({
            error:null,
            token:token
        })
    })
    .catch((err)=>{        
        res.status(401).send({
            error: 'Usuario o contraseña incorrecta',
            token:null
        })
    })
}

module.exports=router