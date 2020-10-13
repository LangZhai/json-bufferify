/**
 * json-bufferify 0.2.0
 * Date: 2020-10-13
 * © 2017-2020 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: https://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/json-bufferify
 */

(bufferify => {
    const types = [
        {
            type: 'Uint8',
            offset: 1
        },
        {
            type: 'Int8',
            offset: 1
        },
        {
            type: 'Uint16',
            offset: 2
        },
        {
            type: 'Int16',
            offset: 2
        },
        {
            type: 'Uint32',
            offset: 4
        },
        {
            type: 'Int32',
            offset: 4
        },
        {
            type: 'Float32',
            offset: 4
        },
        {
            type: 'Float64',
            offset: 8
        }
    ];

    /**
     * Extend anything.
     * @param {any} args = ([deep, ]target, source1[, ...sourceN])
     * @return {any} The result.
     */
    const extend = (...args) => {
        let val,
            deep;
        if (typeof args[0] === 'boolean') {
            val = args.slice(1);
            deep = args[0];
        } else {
            val = args.slice();
        }
        val.forEach(v => {
            if (v instanceof Object) {
                Object.keys(v).forEach(key => val[0][key] = deep ? extend(deep, v[key] instanceof Array ? [] : {}, v[key]) : v[key]);
            } else {
                val[0] = v;
            }
        });
        return val[0];
    };

    /**
     * Convert JSON data to ArrayBuffer.
     * @param {number} offset The start of the DataView where to store the data.
     * @param {Object} data The JSON data.
     * @return {DataView} The DataView of the ArrayBuffer.
     */
    const encode = (offset, data) => {
        let arr = [],
            view = new DataView(new ArrayBuffer(_encode(offset, arr, data)));
        arr.forEach(obj => {
            view[`set${obj.type}`](obj.offset, obj.val);
        });
        return view;
    };

    /**
     * Inner function to Convert JSON data to ArrayBuffer.
     * @param {number} offset The start of the DataView where to store the data.
     * @param {Array} arr The data Array which for use in function 'encode'.
     * @param {Object} data The JSON data.
     * @return {number} The start of the next call.
     */
    const _encode = (offset, arr, data) => {
        if (data instanceof Array) {
            //Here is using a Uint8 to store the length of Array, so the length of Array can only be up to 255.
            arr.push({
                val: data.length,
                type: 'Uint8',
                offset: offset++
            });
        }
        if (data instanceof Array && data[0] instanceof Object) {
            data.forEach(obj => offset = _encode(offset, arr, obj));
        } else {
            Object.keys(data).sort().forEach(key => {
                if (data[key] instanceof Object) {
                    offset = _encode(offset, arr, data[key]);
                } else if (typeof data[key] === 'number') {
                    let flag,
                        val;
                    if (data[key] % 1 || (flag = data[key] < Math.pow(-2, 31) || data[key] > Math.pow(2, 32) - 1)) {
                        val = flag || data[key] < -3.4e38 || data[key] > 3.4e38 ? 7 : 6;
                    } else {
                        if (data[key] < 0) {
                            val = data[key] > Math.pow(-2, 7) ? 1 : data[key] > Math.pow(-2, 15) ? 3 : 5;
                        } else {
                            val = data[key] < Math.pow(2, 8) ? 0 : data[key] < Math.pow(2, 16) ? 2 : 4;
                        }
                    }
                    arr.push({
                        val,
                        type: 'Uint8',
                        offset: offset++
                    }, {
                        val: data[key],
                        type: types[val].type,
                        offset
                    });
                    offset += types[val].offset;
                } else if (typeof data[key] === 'boolean') {
                    arr.push({
                        val: data[key] ? 1 : 0,
                        type: 'Uint8',
                        offset: offset++
                    });
                } else {
                    data[key] = data[key].split('').map(char => char.charCodeAt(0));
                    //Here is using a Uint8 to store the length of string, so the length of string can only be up to 255.
                    arr.push({
                        val: data[key].length,
                        type: 'Uint8',
                        offset: offset++
                    });
                    data[key].forEach(val => {
                        arr.push({
                            val,
                            type: 'Uint16',
                            offset
                        });
                        offset += 2;
                    });
                }
            });
        }
        return offset;
    };

    /**
     * Revert JSON data from ArrayBuffer.
     * @param {number} offset The start of the DataView where to read the data.
     * @param {Object} template The template of the JSON data.
     * @param {(ArrayBuffer|Buffer|DataView)} source The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.
     * @return {Object} The JSON data.
     */
    const decode = (offset, template, source) => {
        _decode(offset, template, source);
        return template;
    };

    /**
     * Inner function to Revert JSON data from ArrayBuffer.
     * @param {number} offset The start of the DataView where to read the data.
     * @param {Object} template The template of the JSON data.
     * @param {(ArrayBuffer|Buffer|DataView)} source The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.
     * @return {number} The start of the next call.
     */
    const _decode = (offset, template, source) => {
        let view;
        if (template instanceof Object) {
            view = source instanceof DataView ? source : new DataView(source instanceof ArrayBuffer ? source : new Uint8Array(source).buffer);
            if (template instanceof Array && (template.length = view.getUint8(offset++))) {
                template.fill(null, 1).forEach((tmpl, i) => template[i] = extend(true, template[0] instanceof Array ? [] : {}, template[0]));
            }
            if (template instanceof Array && template[0] instanceof Object) {
                template.forEach(tmpl => offset = _decode(offset, tmpl, view));
            } else {
                Object.keys(template).sort().forEach(key => {
                    if (template[key] instanceof Object) {
                        offset = _decode(offset, template[key], view);
                    } else if (template[key] === 'number') {
                        let obj = types[view.getUint8(offset++)];
                        template[key] = view[`get${obj.type}`](offset);
                        offset += obj.offset;
                    } else if (template[key] === 'boolean') {
                        template[key] = !!view.getUint8(offset++);
                    } else {
                        template[key] = (template[key] = view.getUint8(offset++)) ? String.fromCharCode(...Array(template[key]).fill().map(() => {
                            let code = view.getUint16(offset);
                            offset += 2;
                            return code;
                        })) : '';
                    }
                });
            }
            return offset;
        }
    };

    bufferify.encode = encode;
    bufferify.decode = decode;
})(typeof module !== 'undefined' && module.exports ? module.exports : (self.bufferify = self.bufferify || {}));