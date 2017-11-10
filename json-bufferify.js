/**
 * json-bufferify 0.1.1
 * Date: 2017-11-10
 * © 2017 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/json-bufferify
 */

((bufferify) => {
    /**
     * Extend anything.
     * @param {any} args = ([deep, ]target, source1[, ...sourceN])
     * @return {any} The result.
     */
    let extend = (...args) => {
        let val,
            deep;
        if (typeof args[0] === 'boolean') {
            val = [].slice.call(args, 1);
            deep = args[0];
        } else {
            val = [].slice.call(args);
        }
        val.forEach((obj) => {
            if (obj instanceof Object) {
                Object.keys(obj).forEach(item => val[0][item] = deep ? extend(deep, {}, obj[item]) : obj[item]);
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
    let encode = (offset, data) => {
        let arr = [],
            view = new DataView(new ArrayBuffer(_encode(offset, arr, data)));
        arr.forEach(item => {
            view[`set${item.type}`](item.offset, item.val);
        });
        return view;
    }

    /**
     * Inner function to Convert JSON to ArrayBuffer.
     * @param {number} offset The start of the DataView where to store the data.
     * @param {Array} arr The data Array which for use in function 'encode'.
     * @param {Object} data The JSON data.
     * @return {number} The start of the next call.
     */
    let _encode = (offset, arr, data) => {
        if (data instanceof Array) {
            //Here is using a Uint8 to store the length of Array, so the length of Array can only be up to 255.
            arr.push({
                val: data.length,
                type: 'Uint8',
                offset: offset++
            });
        }
        if (data instanceof Array && data[0] instanceof Object) {
            data.forEach(item => offset = _encode(offset, arr, item));
        } else {
            Object.keys(data).sort().forEach(item => {
                let current,
                    flag = false;
                if (data[item] instanceof Object) {
                    offset = _encode(offset, arr, data[item]);
                } else if (typeof data[item] === 'number') {
                    arr.push({
                        val: data[item]
                    });
                    current = arr[arr.length - 1];
                    if (data[item] % 1 || (flag = data[item] < Math.pow(-2, 31) || data[item] > Math.pow(2, 32) - 1)) {
                        if (!flag && data[item] >= -3.4e38 && data[item] <= 3.4e38) {
                            arr.splice(arr.length - 1, 0, {
                                val: 6,
                                type: 'Uint8',
                                offset: offset++
                            });
                            current.type = 'Float32';
                            current.offset = offset;
                            offset += 4;
                        } else {
                            arr.splice(arr.length - 1, 0, {
                                val: 7,
                                type: 'Uint8',
                                offset: offset++
                            });
                            current.type = 'Float64';
                            current.offset = offset;
                            offset += 8;
                        }
                    } else {
                        if (data[item] >= 0) {
                            if (data[item] < Math.pow(2, 8)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 0,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Uint8';
                                current.offset = offset;
                                offset += 1;
                            } else if (data[item] < Math.pow(2, 16)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 2,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Uint16';
                                current.offset = offset;
                                offset += 2;
                            } else if (data[item] < Math.pow(2, 32)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 4,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Uint32';
                                current.offset = offset;
                                offset += 4;
                            }
                        } else {
                            if (data[item] > Math.pow(-2, 7)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 1,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Int8';
                                current.offset = offset;
                                offset += 1;
                            } else if (data[item] > Math.pow(-2, 15)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 3,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Int16';
                                current.offset = offset;
                                offset += 2;
                            } else if (data[item] > Math.pow(-2, 31)) {
                                arr.splice(arr.length - 1, 0, {
                                    val: 5,
                                    type: 'Uint8',
                                    offset: offset++
                                });
                                current.type = 'Int32';
                                current.offset = offset;
                                offset += 4;
                            }
                        }
                    }
                } else {
                    data[item] = data[item].split('').map(item => item.charCodeAt(0));
                    //Here is using a Uint8 to store the length of string, so the length of string can only be up to 255.
                    arr.push({
                        val: data[item].length,
                        type: 'Uint8',
                        offset: offset++
                    });
                    data[item].forEach(item => {
                        arr.push({
                            val: item,
                            type: 'Uint16',
                            offset: offset
                        });
                        offset += 2;
                    });
                }
            });
        }
        return offset;
    }

    /**
     * Revert ArrayBuffer to JSON.
     * @param {number} offset The start of the DataView where to read the data.
     * @param {Object} template The template of the JSON.
     * @param {(ArrayBuffer|Buffer|DataView)} source The ArrayBuffer, or the Buffer in Node.js, or the DataView of the ArrayBuffer.
     * @return {Object} The JSON data.
     */
    let decode = (offset, template, source) => {
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
    let _decode = (offset, template, source) => {
        let view;
        if (template instanceof Object) {
            view = source instanceof DataView ? source : new DataView(source instanceof ArrayBuffer ? source : new Uint8Array(source).buffer);
            if (template instanceof Array && (template.length = view.getUint8(offset++))) {
                template.join().split(',').forEach((item, i) => template[i] = extend(true, {}, template[0]));
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