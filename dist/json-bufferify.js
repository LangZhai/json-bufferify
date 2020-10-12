/**
 * json-bufferify 0.1.2
 * Date: 2017-11-13
 * © 2017 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/json-bufferify
 */

(bufferify => {
    const types = {
        Uint8: {
            val: 0,
            offset: 1
        },
        Int8: {
            val: 1,
            offset: 1
        },
        Uint16: {
            val: 2,
            offset: 2
        },
        Int16: {
            val: 3,
            offset: 2
        },
        Uint32: {
            val: 4,
            offset: 4
        },
        Int32: {
            val: 5,
            offset: 4
        },
        Float32: {
            val: 6,
            offset: 4
        },
        Float64: {
            val: 7,
            offset: 8
        }
    };

    /**
     * Extend anything.
     * @param {any} args = ([deep, ]target, source1[, ...sourceN])
     * @return {any} The result.
     */
    const extend = (...args) => {
        let val,
            deep;
        if (typeof args[0] === 'boolean') {
            val = [].slice.call(args, 1);
            deep = args[0];
        } else {
            val = [].slice.call(args);
        }
        val.forEach(obj => {
            if (obj instanceof Object) {
                Object.keys(obj).forEach(key => val[0][key] = deep ? extend(deep, obj[key] instanceof Array ? [] : {}, obj[key]) : obj[key]);
            } else {
                val[0] = obj;
            }
        });
        return val[0];
    };

    /**
     * Convert JSON to ArrayBuffer.
     * @param {number} offset The start of the DataView where to store the data.
     * @param {Object} data The JSON data.
     * @return {DataView} The DataView of the ArrayBuffer.
     */
    const encode = (offset, data) => {
        let arr = [],
            view = new DataView(new ArrayBuffer(_encode(offset, arr, data)));
        arr.forEach(item => {
            view[`set${item.type}`](item.offset, item.val);
        });
        return view;
    };

    /**
     * Inner function to Convert JSON to ArrayBuffer.
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
                        type;
                    if (data[key] % 1 || (flag = data[key] < Math.pow(-2, 31) || data[key] > Math.pow(2, 32) - 1)) {
                        type = flag || data[key] < -3.4e38 || data[key] > 3.4e38 ? 'Float64' : 'Float32';
                    } else {
                        if (data[key] < 0) {
                            type = data[key] > Math.pow(-2, 7) ? 'Int8' : data[key] > Math.pow(-2, 15) ? 'Int16' : 'Int32';
                        } else {
                            type = data[key] < Math.pow(2, 8) ? 'Uint8' : data[key] < Math.pow(2, 16) ? 'Uint16' : 'Uint32';
                        }
                    }
                    arr.push({
                        val: types[type].val,
                        type: 'Uint8',
                        offset: offset++
                    }, {
                        val: data[key],
                        type,
                        offset
                    });
                    offset += types[type].offset;
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
     * Revert ArrayBuffer to JSON.
     * @param {number} offset The start of the DataView where to read the data.
     * @param {Object} template The template of the JSON.
     * @param {(ArrayBuffer|Buffer|DataView)} source The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.
     * @return {Object} The JSON data.
     */
    const decode = (offset, template, source) => {
        _decode(offset, template, source);
        return template;
    };

    /**
     * Inner function to Revert ArrayBuffer to JSON.
     * @param {number} offset The start of the DataView where to read the data.
     * @param {Object} template The template of the JSON.
     * @param {(ArrayBuffer|Buffer|DataView)} source The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.
     * @return {number} The start of the next call.
     */
    const _decode = (offset, template, source) => {
        let view;
        if (template instanceof Object) {
            view = source instanceof DataView ? source : new DataView(source instanceof ArrayBuffer ? source : new Uint8Array(source).buffer);
            if (template instanceof Array && (template.length = view.getUint8(offset++))) {
                template.join().split(',').forEach((item, i) => template[i] = extend(true, template[0] instanceof Array ? [] : {}, template[0]));
            }
            if (template instanceof Array && template[0] instanceof Object) {
                template.forEach(item => offset = _decode(offset, item, view));
            } else {
                Object.keys(template).sort().forEach(item => {
                    if (template[item] instanceof Object) {
                        offset = _decode(offset, template[item], view);
                    } else if (template[item] === 'number') {
                        switch (view.getUint8(offset++)) {
                            case 0:
                                template[item] = view.getUint8(offset);
                                offset += 1;
                                break;
                            case 1:
                                template[item] = view.getInt8(offset);
                                offset += 1;
                                break;
                            case 2:
                                template[item] = view.getUint16(offset);
                                offset += 2;
                                break;
                            case 3:
                                template[item] = view.getInt16(offset);
                                offset += 2;
                                break;
                            case 4:
                                template[item] = view.getUint32(offset);
                                offset += 4;
                                break;
                            case 5:
                                template[item] = view.getInt32(offset);
                                offset += 4;
                                break;
                            case 6:
                                template[item] = view.getFloat32(offset);
                                offset += 4;
                                break;
                            case 7:
                                template[item] = view.getFloat64(offset);
                                offset += 8;
                                break;
                        }
                    } else if (template[item] === 'boolean') {
                        template[item] = !!view.getUint8(offset++);
                    } else {
                        template[item] = (template[item] = view.getUint8(offset++)) ? String.fromCharCode.apply(null, new Array(template[item]).join().split(',').map(() => {
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