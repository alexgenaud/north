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
}
