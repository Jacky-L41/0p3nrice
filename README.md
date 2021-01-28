# Known issue
1. No validation in creating record with coordinates.

# Information
### Integrated accounts for testing
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

Structure:
```
    root/
    ├── models/ (Models)
    ├── views/ (Views)
    ├── public/ (Style config of Views)
    └── server.js (Router and Controller)
```
