/**
 * json-bufferify 0.0.8
 * Date: 2017-07-06
 * © 2017 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/json-bufferify
 */

declare namespace bufferify {
    export function encode(offset: number, data: Object): DataView;
    export function decode(offset: number, template: Object, source: ArrayBuffer): number;
    export function decode(offset: number, template: Object, source: DataView): number;
}