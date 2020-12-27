const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { call } = require('function-bind');
const ObjectId = require('mongodb').ObjectId;
const url = require('./mongodb_url');
const dbName = 'comps381f_project';

const isIdExisted = async (anId) => {
    const client = new MongoClient(url)
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('restaurants');
        const cursor = collection.find({},{projection:{_id:1}});
        await cursor.forEach((doc)=>{
            if(doc._id == anId){
                return true;
            }
        });
    }
    finally{
        await client.close();
    }
    return false;
    
}



const uploadRestaurant = (payload, callback) => {
    const client = new MongoClient(url);

    const insertDocument = (db, callback) => {
        db.collection('restaurants').insertOne( payload, (err, result) => {
           assert.strictEqual(err, null);
           console.log("Inserted one document into the books collection.");
           callback(result);
       });
    };
    if(payload.name!="" && payload.owner!=""){
        client.connect((err) => {
            assert.strictEqual(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            insertDocument(db, () => {
                client.close();
                console.log("Disconnected MongoDB server");
                callback("Successfully uploaded a restaurant record.");
            });
        });
    }else{
        callback("Values of  both \"Name\" and \"Owner\" are required, you modified, don't you?");
    }
}

const getRestaurantList = (query, callback) => {
    var findRestaurants = function(db, callback) {
        // Get the documents collection
        var collection = db.collection('restaurants');
        // Find some documents
        // option = {projection: {'name': 1,'borough': 1, 'cuisine': 1, 'create_by':1}}
        option = {};
        collection.countDocuments(query, (err,count)=>{
            assert.strictEqual(err,null);
            collection.find(query, option).toArray(function(err, docs) {
                assert.strictEqual(err, null);
                console.log("Found the following records");
                //   console.log(docs)
                callback(docs,count);
            });
        });
    }

    const client = new MongoClient(url);
    client.connect((err) => {
        assert.strictEqual(null,err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        findRestaurants(db,(a_list, count) => {
           client.close();
           callback(a_list, count);
        })
    });
}

const getRestaurant = (r_id, callback) => {
    const client = new MongoClient(url);
    client.connect((err)=>{
        assert.strictEqual(err,null);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const collection = db.collection('restaurants');
        collection.findOne({_id: ObjectId(r_id)}, (err,doc)=>{
            assert.strictEqual(err,null);
            console.log("Found records");
            // console.log(doc);
            callback(doc);
        })
    })
}

const uploadRate = (payload, callback) => {
    const client = new MongoClient(url);
    var message = "";
    const insertRate = (db, callback) => {
        // console.log(JSON.stringify(payload));
        db.collection('restaurants').updateOne( {_id: ObjectId(payload._id)},{$push: {grades: {user:payload.user,score:payload.score}}}, (err, result) => {
           assert.strictEqual(err, null);
           console.log("Successfully uploaded rate");
           callback(result);
       });
    };
    var n = Math.floor(Number(payload.score));
    if(n !== Infinity && String(n) === payload.score && n > 0 && n <= 10){
        client.connect((err) => {
            assert.strictEqual(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            insertRate(db, () => {
                client.close();
                console.log("Disconnected MongoDB server");
                message = "Successfully rate the restaurant.";
                callback(message);
            });
        });
    }
    else{
        message = "Score format not match, you modified, don't you?";
        callback(message);
    }
}

const deleteRestaurant = (r_id,callback) =>{
    const client = new MongoClient(url);
    client.connect((err)=>{
        assert.strictEqual(err,null);
        const db = client.db(dbName);
        const collection = db.collection('restaurants');
        collection.deleteOne({_id: ObjectId(r_id)},(err)=>{
            assert.strictEqual(err,null);
            callback();
        });
    });
}

const editRestaurant = (payload, anId, callback)=>{
    const client = new MongoClient(url);
    if(payload.name!="" && payload.owner!=""){
        client.connect((err)=>{
            assert.strictEqual(err,null);
            const db = client.db(dbName);
            const collection = db.collection('restaurants');
            collection.updateOne({_id:ObjectId(anId)}, {$set: payload},(err)=>{
                assert.strictEqual(err,null);
                callback("Successfully edited the record.");
            })
        });
    }else{
        callback("Values of  both \"Name\" and \"Owner\" are required, you modified, don't you?");
    }
}
module.exports = { uploadRestaurant: uploadRestaurant,
                   getRestaurantList: getRestaurantList,
                   getRestaurant: getRestaurant,
                   uploadRate: uploadRate,
                   isIdExisted: isIdExisted,
                   deleteRestaurant: deleteRestaurant,
                   editRestaurant: editRestaurant
                 };


