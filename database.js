const db = require("mongoose");
//const URI = "mongodb://localhost/viajes";
const URI = require("./config").mongoURI

db.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Db conectada"))
    .catch((err) => console.log(err)); 


module.exports=db;