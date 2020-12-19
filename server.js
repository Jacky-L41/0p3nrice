const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// const ObjectId = require('mongodb').ObjectID;
import { url } from "./mongodb_url.js";
const dbName = 'comps381f_project';


app.set('view engine','ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
    {name: 'demo', password: ''},
    {name: 'student', password: ''}
);

app.set('view engine','ejs');

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY]
}));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    console.log(req.session);
    if (!req.session.authenticated) {    // user not logged in!
        res.redirect('/login');
    } else {
        res.status(200).render('secrets',{name:req.session.username});
    }
});

app.get('/login', (req,res) => {
    res.status(200).render('login',{loginMessage: ''});
});

app.post('/login', (req,res) => {
    var error = true;
    users.forEach((user) => {
        if (user.name == req.body.name && user.password == req.body.password) {
            // correct user name + password
            // store the following name/value pairs in cookie session
            error = false
            req.session.authenticated = true;        // 'authenticated': true
            req.session.username = req.body.name;	 // 'username': req.body.name		
        }
    });
    if (error){
        res.status(200).render('login', {loginMessage: "User not existed or Password not correct."})
    }
    else{
        res.redirect('/');
    }
});

app.post('/register', (req,res) => {
    var isExisted = false;
    for (i = 0; i < users.length; i++){
        if (users[i].name == req.body.name){
            isExisted = true;
            break;
        }
    }
    if (isExisted){
        res.status(200).render('register_result', {message: "User existed!"});

    }
    else{
        users.push({name: req.body.name, password: req.body.password});
        res.status(200).render('register_result', {message: "Successfully register!"});
        
    }
});

app.get('/create_restaurant', (req,res) => {
    if (req.session.authenticated){
        res.status(200).render('create_restaurant',{});
    }
    else{
        res.status(401).end("Unauthorized");
    }
});



app.post('/create_restaurant', (req,res) => {
    if (req.session.authenticated){
        payload = {restaurant_id: req.body.r_id, 
                   name: req.body.name, 
                   borough: req.body.borough,
                   cuisine: req.body.cuisine,
                   photo: req.body.photo,
                   photo_mimetype: req.body.photo_mime,
                   address: req.body.address,
                   grades: req.body.grades,
                   owner: req.body.owner
                   }   
        const client = new MongoClient(url);
        const insertDocument = (db, callback) => {
            db.collection('restaurants').insertOne( payload, (err, result) => {
               assert.strictEqual(err, null);
               console.log("Inserted one document into the books collection.");
               callback(result);
           });
        };
        client.connect((err) => {
            assert.strictEqual(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            insertDocument(db, () => {
                client.close();
                console.log("Disconnected MongoDB server");
                res.redirect('/')
            });
        });
    }
    else{
        res.status(401).end("Unauthorized");
    }
});

app.get('/logout', (req,res) => {
    req.session = null;   // clear cookie-session
    res.redirect('/');
});

app.listen(process.env.PORT || 8099);
