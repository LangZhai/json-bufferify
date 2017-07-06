# json-bufferify

This is a module to help you convert between JSON and ArrayBuffer, and you can run it in both Node.js and browser.

## Feature

* Convert JSON to ArrayBuffer and return the DataView.
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
var view = bufferify.encode(0, { name: 'Bob', sex: 0, age: 25 });
var ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';
ws.send(view);
```

### Revert ArrayBuffer to JSON.

```javascript
ws.on('message', (data) => {
    var obj = { name: 'string', sex: 'number', age: 'number' };
    bufferify.decode(0, obj, data);
    console.log(obj);
});
```

## Documentation

### bufferify.encode(offset, data)

Convert JSON to ArrayBuffer and return the DataView.

* `offset` - The start of the DataView where to store the data.
* `data` - The JSON data.

### bufferify.decode(offset, obj, source)

Revert ArrayBuffer to JSON.

* `offset` - The start of the DataView where to read the data.
* `obj` - The template of the JSON.
* `source` - The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.