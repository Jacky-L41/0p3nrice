const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();

const dbactions = require('./models/dbactions');

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
		dbactions.getRestaurantList((r_list)=>{
			// console.log(r_list);
			res.status(200).render('mainpage',{name:req.session.username,rList: r_list});
		});
        // res.status(200).render('mainpage',{name:req.session.username,rList: dbactions.getRestaurantList()});
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
				   street: req.body.street,
				   building: req.body.building,
				   zipcode: req.body.zipcode,
				   coord: [req.body.coord_lon, req.body.coord_lat],
				   owner: req.body.owner,
				   create_by: req.session.username
                   }   

		dbactions.uploadRestaurant(payload,()=>{
			res.redirect('/');
		});
    }
    else{
        res.status(401).end("Unauthorized");
    }
});

app.get('/details', (req,res) => {
	if(req.session.authenticated){
		if(req.query._id != ''){
			dbactions.getRestaurant(req.query._id, (aRestaurant)=>{
				res.render('details', { aRestaurant: aRestaurant});
			});
		}else{
			res.redirect('/');
		}
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
