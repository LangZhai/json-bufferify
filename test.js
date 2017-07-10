var bufferify = require('./json-bufferify');

console.log(bufferify.decode(10, {
    name: 'string',
    age: 'number',
    sex: 'number'
}, bufferify.encode(10, {
    sex: 0,
    name: 'Bob',
    age: 25
})));

console.log(bufferify.decode(0, ['number'], bufferify.encode(0, [1, 2, 3, 4, 5, 6, 7, 8, 9])));

console.log(bufferify.decode(0, {
    arr: ['number'],
    list: [{
        id: 'string',
        name: 'string'
    }]
}, bufferify.encode(0, {
    arr: [1, 2, 3, 4, 5],
    list: [{
        name: 'Jerry',
        id: '536598'
    },
    {
        name: 'Tom',
        id: '85947'
    },
    {
        id: '459823',
        name: 'Kevin'
    }]
})));