import express from 'express'
import session from "express-session"
import mysql from 'mysql'
import {pbkdf2} from 'node:crypto'
import querry from './querry'

const app = express()
const port = 3000

declare module 'express-session' {
  interface SessionData {
    count?: number;
    userid?: number;
  }
}

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "amy",
  password: "4397Amy",
  database: "mysql"
})

app.use(express.static('./client/dist'))
app.use(express.urlencoded({extended: false}))
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'need to be changed'
}))

app.get('/blar', (req: express.Request, res: express.Response) => {
  if(!req.session.count){
    req.session.count = 0;
  }
  req.session.count++;

  res.send('blar World! ' + req.session.count)
})

app.get('/access', (req: express.Request, res: express.Response) =>{
  if(req.session.userid){
    res.send("AccessGranted");
  } else{
    res.redirect("/login.html");
  }
});

app.post('/login.html',  async (req: express.Request, res: express.Response, next)=>{

  let password = (req.body.password as string).normalize();
  let email = (req.body.email as string).normalize();

  if(!email){
    res.send("Email is needed");
    return;
  } else if (!password){
    res.send("Password ist needed");
    return;
  }

  let passwordHash: string;
  let userID: number;

  try{
    let result = await querry(dbConnection, "SELECT id, passwordHash FROM SnakeMaze.users where email = '" + req.body.email + "';");
    console.log(result);

    if(result.length == 0){
      res.send("no account with gieven email exists");
      return;
    }
    passwordHash = result[0].passwordHash,
    userID = result[0].id;
  } catch(err) {
    res.send("internal database error");
    return;
  }

  pbkdf2(password, email, 100000, 64, 'sha512', async (err, derivedKey) => {
    if (err) {
      res.send("internal hash error");
      return;
    }
    if( passwordHash == derivedKey.toString('hex')){
      req.session.userid = userID;
      res.send("Login successfull");
    }
    
  });
})

app.post('/regristate.html',  async (req: express.Request, res: express.Response, next)=>{

  let password = (req.body.password as string).normalize();
  let confirm_password = (req.body.confirm_password as string).normalize();
  let email = (req.body.email as string).normalize();

  if(!email){
    res.send("Email is needed");
    return;
  } else if (!password){
    res.send("Password ist needed");
    return;
  } else if (password != confirm_password){
    res.send("Password and confirmation aren't equal");
    return;
  }

  try{
    let result = await querry(dbConnection, "SELECT email FROM SnakeMaze.users where email = '" + req.body.email + "';");
    console.log(result);

    if(result.length != 0){
      res.send("Email already used");
      return;
    }

  } catch(err) {
    res.send("internal database error");
    return;
  }

  pbkdf2(password, email, 100000, 64, 'sha512', async (err, derivedKey) => {
    if (err) {
      res.send("internal hash error");
      return;
    }
    console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
    try{
      await querry(dbConnection, "INSERT INTO SnakeMaze.users (email, passwordHash) VALUES ('" + email + "', '" + derivedKey.toString('hex') + "');");
      res.send("regristration successfull")
  
    } catch(err) {
      console.log(err);
      res.send("internal database error");
      return;
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})