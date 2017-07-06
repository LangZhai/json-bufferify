var bufferify = require('./json-bufferify'),
    obj = {name: 'string', sex: 'number', age: 'number'},
    view = bufferify.encode(10, {name: 'Bob', sex: 0, age: 25});

bufferify.decode(10, obj, view);
console.log(obj);