const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const formidable = require('formidable');
const dbactions = require('./models/dbactions');
// const { ObjectId } = require('bson');
const fs = require('fs');
const assert = require('assert');
const IsInteger = require('es-abstract/2015/IsInteger');
// const { find } = require('methods');
// const { arch } = require('os');
// const { assert } = require('console');
// const { fstat } = require('fs');

app.use(express.static('public'));
app.set('view engine', 'ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
    { name: 'demo', password: '' },
    { name: 'student', password: '' }
);

app.set('view engine', 'ejs');

app.use(session({
    name: 'loginSession',
    keys: [SECRETKEY],
}));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log(req.session);
    if (!req.session.authenticated) {    // user not logged in!
        res.redirect('/login');
    } else {
        dbactions.getRestaurantList({},(r_list, count) => {
            res.status(200).render('mainpage', { name: req.session.username,
                                                rList: r_list,
                                                docCount: count,
                                                fromSearch: false,
                                                searchString: "",
                                                searchBy:""
                                            });
        });
        // res.status(200).render('mainpage',{name:req.session.username,rList: dbactions.getRestaurantList()});
    }
});

app.post('/search', (req,res)=>{
    if(!req.session.authenticated){
        res.render('result', {message: "Not logged in."});
    }
    else{
        dbQuery = {};
        if(req.body.searchBy.length > 0 && req.body.searchString.length > 0){
            dbQuery[req.body.searchBy] = req.body.searchString;
        }
        dbactions.getRestaurantList(dbQuery,(r_list, count)=>{
            res.status(200).render('mainpage', { name: req.session.username, 
                                                rList: r_list,
                                                docCount: count,
                                                fromSearch: true,
                                                searchString: req.body.searchString,
                                                searchBy: req.body.searchBy
                                            });
        });
    }
});

app.get('/login', (req, res) => {
    res.status(200).render('login', { loginMessage: '' });
});

app.post('/login', (req, res) => {
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
    if (error) {
        res.status(200).render('login', { loginMessage: "User not existed or Password not correct." })
    }
    else {
        res.redirect('/');
    }
});

app.post('/register', (req, res) => {
    var isExisted = false;
    for (i = 0; i < users.length; i++) {
        if (users[i].name == req.body.name) {
            isExisted = true;
            break;
        }
    }
    if (isExisted) {
        res.status(200).render('result', { message: "User existed!" });

    }
    else {
        users.push({ name: req.body.name, password: req.body.password });
        res.status(200).render('result', { message: "Successfully register!" });

    }
});

app.get('/create', (req, res) => {
    if (req.session.authenticated) {
        res.status(200).render('create', {});
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.post('/create', (req, res) => {
    if (req.session.authenticated) {
        payload = {};
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            assert.strictEqual(err, null);
            payload['restaurant_id'] = fields.r_id;
            payload['name'] = fields.name;
            payload['borough'] = fields.borough;
            payload['cuisine'] = fields.cuisine;
            payload['address'] = {
                street: fields.street,
                building: fields.building,
                zipcode: fields.zipcode,
                coord: [fields.coord_lon, fields.coord_lat]
            };
            payload['grades'] = [];
            payload['owner'] = fields.owner;
            payload['create_by'] = req.session.username;
            payload['photo'] = '';
            payload['mimetype'] = '';
            if (files.photo && files.photo.size > 0) {
                fs.readFile(files.photo.path, (err, data) => {
                    assert.strictEqual(err, null);
                    payload['photo'] = new Buffer.from(data).toString('base64');
                    payload['mimetype'] = files.photo.type;
                    dbactions.uploadRestaurant(payload, () => {
                        res.redirect('/');
                    });
                });
            } else {
                dbactions.uploadRestaurant(payload, (msg) => {
                    res.render('result', {message: msg});
                });
            }
        });
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.get('/details', (req, res) => {
    if (req.session.authenticated) {
        if (req.query._id != '') {
            dbactions.getRestaurant(req.query._id, (aRestaurant) => {
                var isRated = false;
                if (Array.isArray(aRestaurant.grades) && aRestaurant.grades.length > 0) {
                    aRestaurant.grades.forEach((gradeRec) => {
                        if (gradeRec.user == req.session.username) {
                            isRated = true
                        }
                    });
                }
                res.render('details', {
                    aRestaurant: aRestaurant,
                    isRated: isRated,
                    isRecordOwner: (aRestaurant.create_by == req.session.username)
                });
            });
        } else {
            res.redirect('/');
        }
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.get('/rate', (req, res) => {
    if (req.session.authenticated) {
        if (req.query._id != '') {
            dbactions.getRestaurant(req.query._id, (aRestaurant) => {
                var isRated = false;
                if (Array.isArray(aRestaurant.grades) && aRestaurant.grades.length > 0) {
                    aRestaurant.grades.forEach((gradeRec) => {
                        if (gradeRec.user == req.session.username) {
                            isRated = true
                        }
                    });
                }
                res.render('rate', {
                    aRestaurant: aRestaurant,
                    is_rated: isRated
                });
            });
        } else {
            res.redirect('/');
        }
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.post('/rate', (req, res) => {
    if (req.session.authenticated) {
        payload = {
            "_id": req.query._id,
            "user": req.session.username,
            "score": req.body.score
        }
        dbactions.uploadRate(payload, (msg) => {
            res.render('result', { message: msg });
        });
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.get('/delete', (req, res) => {
    if (req.session.authenticated) {
        if (req.query._id != '') {
            dbactions.getRestaurant(req.query._id, (aRestaurant) => {
                if (aRestaurant.create_by == req.session.username) {
                    dbactions.deleteRestaurant(req.query._id, () => {
                        res.render('result', { message: "Successfully deleted " + aRestaurant.name + " record." });
                    });
                } else {
                    res.render('result', { message: "You are not authorized to delete" });
                }
            });
        } else {
            res.redirect('/');
        }
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.get('/edit', (req, res) => {
    if (req.session.authenticated) {
        if (req.query._id != '') {
            dbactions.getRestaurant(req.query._id, (aRestaurant) => {
                if (aRestaurant.create_by == req.session.username) {
                    res.render('edit', { aRestaurant: aRestaurant });
                } else {
                    res.render('result', { message: "You are not authorized to edit" });
                }
            });
        } else {
            res.redirect('/');
        }
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.post('/edit', (req, res) => {
    if (req.session.authenticated) {
        payload = {};
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            assert.strictEqual(err, null);
            var anId = fields._id
            var create_by = fields.create_by;
            if (create_by == req.session.username) {
                payload['restaurant_id'] = fields.r_id;
                payload['name'] = fields.name;
                payload['borough'] = fields.borough;
                payload['cuisine'] = fields.cuisine;
                payload['address'] = {
                    street: fields.street,
                    building: fields.building,
                    zipcode: fields.zipcode,
                    coord: [fields.coord_lon, fields.coord_lat]
                };
                payload['owner'] = fields.owner;
                if (files.photo && files.photo.size > 0) {
                    fs.readFile(files.photo.path, (err, data) => {
                        assert.strictEqual(err, null);
                        payload['photo'] = new Buffer.from(data).toString('base64');
                        payload['mimetype'] = files.photo.type;
                        dbactions.editRestaurant(payload, anId, () => {
                            res.redirect('/');
                        });
                    });
                } else {
                    dbactions.editRestaurant(payload, anId, (msg) => {
                        res.render('result', {message: msg});
                    });
                }
            }
            else{
                res.render('result', {message: "You are not authorized to edit."});
            }
        });
    }
    else {
        res.status(401).end("Unauthorized");
    }
});

app.get("/map", (req,res) => {
    res.render("leaflet.ejs", {
        lon:req.query.lon,
        lat:req.query.lat,
        zoom:req.query.zoom ? req.query.zoom : 15
    });
});

app.get('/logout', (req, res) => {
    req.session = null;   // clear cookie-session
    res.redirect('/');
});




app.get('/api/restaurant/name/:name', (req, res) => {
    dbQuery = {}
    dbQuery['name'] = req.params.name;
    dbactions.getRestaurantList(dbQuery,(r_list, count)=>{
        if(count == 0){
            res.status(200).type('json').json({}).end();
        }
        else{
            res.status(200).type('json').json(r_list).end();
        }
    });
});

app.get('/api/restaurant/borough/:borough', (req, res) => {
    dbQuery = {}
    dbQuery['borough'] = req.params.borough;
    dbactions.getRestaurantList(dbQuery,(r_list, count)=>{
        if(count == 0){
            res.status(200).type('json').json({}).end();
        }
        else{
            res.status(200).type('json').json(r_list).end();
        }
    });
});

app.get('/api/restaurant/cuisine/:cuisine', (req, res) => {
    dbQuery = {}
    dbQuery['cuisine'] = req.params.cuisine;
    dbactions.getRestaurantList(dbQuery,(r_list, count)=>{
        if(count == 0){
            res.status(200).type('json').json({}).end();
        }
        else{
            res.status(200).type('json').json(r_list).end();
        }
    });
});

app.listen(process.env.PORT || 8099);
