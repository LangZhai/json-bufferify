# json-bufferify [![Travis](https://img.shields.io/travis/LangZhai/json-bufferify.svg)](https://travis-ci.org/LangZhai/json-bufferify/builds) [![npm (tag)](https://img.shields.io/npm/v/json-bufferify.svg)](https://www.npmjs.com/package/json-bufferify) [![npm](https://img.shields.io/npm/l/json-bufferify.svg)](http://www.gnu.org/licenses/lgpl.html) ![Github file size](https://img.shields.io/github/size/langzhai/json-bufferify/json-bufferify.js.svg)

This is a module to help you convert between JSON and ArrayBuffer, and you can run it in both Node.js and browser.

## Feature

* Convert JSON to ArrayBuffer.
* Revert ArrayBuffer to JSON.

## Installation

```
npm install json-bufferify
```

## Usage

### Require json-bufferify.

__In Node.js__

```javascript
var bufferify = require('json-bufferify');
```

__In browser__

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

### Convert JSON to ArrayBuffer and send by WebSocket.

```javascript
var ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';
ws.send(bufferify.encode(0, { name: 'Bob', sex: 0, age: 25 }));
```

### Revert ArrayBuffer to JSON.

```javascript
ws.on('message', (data) => {
    console.log(bufferify.decode(0, { name: 'string', sex: 'number', age: 'number' }, data));
});
```

## Documentation

### bufferify.encode(offset, data)

Convert JSON to ArrayBuffer and return the DataView.

* `offset` - The start of the DataView where to store the data.
* `data` - The JSON data.

### bufferify.decode(offset, template, source)

Revert ArrayBuffer to JSON data and return it.

* `offset` - The start of the DataView where to read the data.
* `template` - The template of the JSON.
* `source` - The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.