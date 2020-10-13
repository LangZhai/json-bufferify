/**
 * json-bufferify 0.2.0
 * Date: 2020-10-13
 * © 2017-2020 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: https://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/json-bufferify
 */

declare namespace bufferify {
    export function encode(offset: number, data: Object): DataView;
    export function decode(offset: number, template: Object, source: ArrayBuffer): Object;
    export function decode(offset: number, template: Object, source: DataView): Object;
}