# [json-bufferify](https://github.com/LangZhai/json-bufferify) [![Travis (.org)](https://img.shields.io/travis/LangZhai/json-bufferify)](https://travis-ci.org/LangZhai/json-bufferify/builds) [![npm](https://img.shields.io/npm/v/json-bufferify)](https://www.npmjs.com/package/json-bufferify) ![GitHub file size in bytes](https://img.shields.io/github/size/LangZhai/json-bufferify/dist/json-bufferify.min.js)

This is a tiny module to help you convert between JSON data and ArrayBuffer, and you can use it in both Node.js and browsers.

## Feature

* Convert JSON data to ArrayBuffer.
* Revert JSON data from ArrayBuffer.

## Installation

```
npm install json-bufferify
```

## Usage

### Import json-bufferify.

__In Node.js__

CommonJS

```javascript
const bufferify = require('json-bufferify');
```

ES6 Modules

```javascript
import bufferify from 'json-bufferify';
```

__In browsers__

```html
<script src="json-bufferify.js"></script>
```

__In TypeScript__

```javascript
import bufferify = require('json-bufferify');
```

__In Egret__

Open "egretProperties.json" and Add the following code to "modules" node.

```json
{
    "name": "json-bufferify",
    "path": "D:/Work/modules/json-bufferify"
}
```

### Convert JSON data to ArrayBuffer and send via WebSocket.

```javascript
let ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';
ws.send(bufferify.encode(0, {
    sex: 0,
    name: 'Bob',
    age: 25
}));
```

### Revert JSON data from ArrayBuffer.

```javascript
ws.on('message', data => {
    console.log(bufferify.decode(0, {
        name: 'string',
        sex: 'number',
        age: 'number'
    }, data));
});
```

## API

### bufferify.encode(offset, data)

Convert JSON data to ArrayBuffer and return the DataView.

* `offset` - The start point of the DataView where to store the data.
* `data` - The JSON data.

### bufferify.decode(offset, template, source)

Revert JSON data from ArrayBuffer and return it.

* `offset` - The start point of the DataView where to read the data.
* `template` - The template of the JSON data.
* `source` - The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.

## Example

### Convert/Revert an array.

```javascript
let ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';
ws.send(bufferify.encode(0, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
```

```javascript
ws.on('message', data => {
    console.log(bufferify.decode(0, ['number'], data));
});
```

### Convert/Revert a complex Object.

```javascript
let ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';
ws.send(bufferify.encode(0, {
    obj: {
        opcode: 8,
        info: 'Hello'
    },
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
}));
```

```javascript
ws.on('message', data => {
    console.log(bufferify.decode(0, {
        arr: ['number'],
        obj: {
            opcode: 'number',
            info: 'string'
        },
        list: [{
            id: 'string',
            name: 'string'
        }]
    }, data));
});
```

## Compatibility

* The latest LTS version of Node.js.
* Modern browsers such as Chrome, Firefox, Edge(Chromium-based), Safari.

## License [![NPM](https://img.shields.io/npm/l/json-bufferify)](https://github.com/LangZhai/json-bufferify/blob/master/LICENSE)

This is licensed under the GNU LGPL, version 3 or later.