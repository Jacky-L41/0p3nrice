const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
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
    client.connect((err) => {
        assert.strictEqual(null,err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        insertDocument(db, () => {
            client.close();
            console.log("Disconnected MongoDB server");
            callback()
        });
    });
}

const getRestaurantList = (callback) => {
    var findRestaurants = function(db, callback) {
        // Get the documents collection
        var collection = db.collection('restaurants');
        // Find some documents
        collection.find({}, {projection: {'name': 1}}).toArray(function(err, docs) {
          assert.strictEqual(err, null);
          console.log("Found the following records");
        //   console.log(docs)
          callback(docs);
        });
      }

    const client = new MongoClient(url);
    client.connect((err) => {
        assert.strictEqual(null,err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        findRestaurants(db,(a_list) => {
           client.close();
           callback(a_list);
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
    const insertDocument = (db, callback) => {
        // console.log(JSON.stringify(payload));
        db.collection('restaurants').updateOne( {_id: ObjectId(payload._id)},{$push: {grades: {user:payload.user,score:payload.score}}}, (err, result) => {
           assert.strictEqual(err, null);
           console.log("Successfully uploaded rate");
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
            callback()
        });
    });
}

module.exports = { uploadRestaurant: uploadRestaurant,
                   getRestaurantList: getRestaurantList,
                   getRestaurant: getRestaurant,
                   uploadRate: uploadRate,
                   isIdExisted: isIdExisted
                 };


