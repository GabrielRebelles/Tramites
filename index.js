require("dotenv").config()
const express = require('express')
const app=express()
const viajes=require('./api/viajes/network')
const auth=require('./api/auth/network')
const path = require('path')
const db=require('./database')
const PORT= process.env.PORT || 4000;


//Middlewares:
app.use(express.json())
app.use((req,res,next)=>{
    //middleware para eliminar el Powered:Express y el cache
    res.removeHeader('X-Powered-By')
    res.set({"Cache-Control":"no-store"})
    next()
})

//Rutas
app.use('/api/',viajes)
app.use('/api/auth',auth)

//Estaticos
app.use('/',express.static(path.join(__dirname,'app','public')))


//Err 404:
app.use((req,res,next)=>{
    res.redirect('/')
})

//Inicializacion server
const server=app.listen(PORT,()=>{
    console.log(`Server corriendo en http://localhost:${server.address().port}`);
})
