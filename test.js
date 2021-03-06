const bufferify = require('./dist/json-bufferify.min.js');

console.log(bufferify.decode(10, {
    name: 'string',
    age: 'number',
    sex: 'number',
    flag: 'boolean'
}, bufferify.encode(10, {
    sex: 0,
    name: 'Bob',
    flag: true,
    age: 25
})));

console.log(bufferify.decode(0, ['number'], bufferify.encode(0, [1, 2, 3, 4, 5, 6, 7, 8, 9])));

console.log(bufferify.decode(0, {
    arr: ['number'],
    obj: {
        opcode: 'number',
        info: 'string'
    },
    list: [
        {
            id: 'string',
            name: 'string'
        }
    ]
}, bufferify.encode(0, {
    obj: {
        opcode: 8,
        info: 'Hello'
    },
    arr: [1, 2, 3, 4, 5],
    list: [
        {
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
        }
    ]
})));

console.log(bufferify.decode(0, ['number'], bufferify.encode(0, [])));

console.log(bufferify.decode(0, {
    str: 'string'
}, bufferify.encode(0, {
    str: ''
})));

console.log(bufferify.decode(0, [
    {
        arr: ['number']
    }
], bufferify.encode(0, [
    {
        arr: [1, 2, 3, 4, 5]
    },
    {
        arr: [6, 7, 8, 9]
    }
])));