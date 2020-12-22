# To Do:
1. show Leaflet link when coord is available

# Known issue
1. Service will crack down when modify randomly query "_id". The cause is the "if" check in server.js only check if the query is empty, other than checking whether the _id exists in the mongodb.

# Accounts
Integrated accounts: 
student (no password)
demo (no password)

### After clone
Add your mongodb connection url to models/mongodb_url.js

```
echo "const url = ''; module.exports = url;" > models/mongodb_url.js
```

### Installing
```
npm install
```
### Running
```
npm start
```
### Testing
Go to http://localhost:8099


Upload Rate:
db.restaurants.update({ _id: payload._id }, {$push: {grades: {user:"student",score:1}}})

Modify Rate:
db.restaurants.update({ _id: payload._id },{ $set: { "grades.$\[elem\].score" : 2 } },{arrayFilters: [ { "elem.user": { $eq: "demo" } } ]})