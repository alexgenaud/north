import Stack from '../north/Stack';

/*
TODO map bytes to memory byte[]
by type and value byte length
000-099 1 byte constants 0,1,2, and s8 (-128-127) variables.
010-099 1 byte addresses core functions
100-199 2 byte i16
200-299 4 byte f16
100-199 var byte address arrays i15[] for colon definitions
200-299 var byte UTF-8 strings
 */
export default class Data {
    value: ((stack: Stack) => void) | number | number[] | string = 0;

    is_integer = false;
    is_address = false; // TODO not quite used yet

    is_string = false;

    is_fn_core = false;
    is_fn_colon_array = false;

    is_fn_immediate = false;
    is_fn_condition = false;

    constructor(value: ((s: Stack) => void) | boolean | number | number[] | string) {
        if (typeof value === 'boolean') {
            this.is_integer = true;
            this.value = value ? 1 : 0;
            return;
        }
        if (typeof value === 'number') this.is_integer = true;
        else if (typeof value === 'string') this.is_string = true;
        else if (typeof value === 'function') this.is_fn_core = true;
        else if (Array.isArray(value)) this.is_fn_colon_array = true;
        else throw new Error("Unexpected type: " + (typeof value)
                + " to construct Data with input value: " + value);
        this.value = value;
    }

    dump(): {"i8": number, "val": ((s: Stack) => void) | number | number[] | string } {
        let i8 = 0;

        if (this.is_fn_core && this.is_fn_colon_array) {
            if (this.is_fn_colon_array) i8 += 128; // "10-- 0000"
            else if (this.is_fn_core) i8 += 128 + 64; // "11-- 0000"
            if (this.is_fn_immediate) i8 += 32; // "1-1- 0000"
            if (this.is_fn_condition) i8 += 16; // "1--1 0000"
        } else if (this.is_string) {
            i8 += 64; // "0100 0000"
        } else if ((this.is_integer || this.is_address) &&
            (typeof this.value === 'number') && this.value < 64) {
            i8 += this.value; "00-- ----"
        }

        return {"i8": i8, "val": this.value};
    }
}
