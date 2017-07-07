var bufferify = require('./json-bufferify'),
    template = {name: 'string', sex: 'number', age: 'number'},
    view = bufferify.encode(10, {name: 'Bob', sex: 0, age: 25});

bufferify.decode(10, template, view);
console.log(template);