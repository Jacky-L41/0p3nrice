# Known issue
1. No validation in creating record with coordinates.

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

# Notes

### Upload Rate:
```
db.restaurants.update({ _id: payload._id }, {$push: {grades: {user:"student",score:1}}})
```

### Modify Rate:
```
db.restaurants.update({ _id: payload._id },{ $set: { "grades.$[elem].score" : 2 } },{arrayFilters: [ { "elem.user": { $eq: "demo" } } ]})
```