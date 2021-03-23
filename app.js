const express = require("express");
const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid');
const session = require("express-session") // ci permette di lavorare con le sessioni
const MongoStore = require('connect-mongo'); // per memorizzare le sessioni in mongodb
require("dotenv").config()

// Set PORT
const PORT = process.env.PORT || 3000;

// Create the express apllication
const app = express(); // creiamo l'oggetto app, invocando la funzione express

// ex body parser
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// UUID, per generare un file di sessione unico e casuale


//creiamo connessione a mongodb
mongoose.connect(process.env.MONGO_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "error"))
db.once("open", ()=> console.log("connected db!"))

app.use(session({
    secret: 'miaChiaveSegreta123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // in ambiente di sviluppo: false, in produzione: true
    genid: ()=> uuidv4(),
    store: MongoStore.create({ mongoUrl: process.env.MONGO_DB })
  }))



// 1)Prima di andare su login, provare ad andare su rotta-2 e vedere il risultato
// 2)andare sulla rotta login in modo da impostare la session (i cookies)
// 3)se poi vado su rotta-2 di nuovo vedrò i dati visualizzati
app.get("/login", (req, res)=>{
    console.log(req.session.id)
    req.session.colorePreferito = "Verde"
    req.session.isLogged = true;
    res.send()
})

// 4) infine per fare il logout imposto isLogged (nome arbitrario) su false
app.get("/logout", (req, res)=>{
    console.log(req.session.id)
    req.session.colorePreferito = "Verde"
    req.session.isLogged = false; //cambio questo su false per fare logout OPPURE:
    // req.session.destroy(err => console.log(err));
    res.send()
})

// assegnando a questo valore di req.session "isLogged" il valore true, possiamo decidere in rotta-2 se visualizzare o meno i dati, in base al valore del cookie memorizzato in req.session.isLogged, il quale può essere true o false
app.get("/rotta-2", (req, res)=>{
    if(req.session.isLogged){
        res.send("il tuo colore preferito è: " + req.session.colorePreferito + "<br>" + "l'id del cookie è: " + req.session.id)
    }else{
        res.send("Non loggato")
    }
    
})


// Run server
app.listen(PORT, ()=>{
    console.log("Server listening on port: ", PORT)
})