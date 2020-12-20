const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;
const url = require('./mongodb_url');
const dbName = 'comps381f_project';


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

module.exports = { uploadRestaurant: uploadRestaurant,
                   getRestaurantList: getRestaurantList,
                   getRestaurant: getRestaurant
                 };


