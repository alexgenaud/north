// types.ts
export interface DataBlock {
    address: number;
    type:
        | "tiny"
        | "int"
        | "float"
        | "ptr"
        | "str"
        | "core"
        | "colon"
        | "uninit";
    value: number | number[] | string;
    selected: boolean;
}

export function createUninitDataBlock(address: number): DataBlock {
    return {
        address: address,
        type: "uninit",
        value: 0,
        selected: false,
    };
}

/*
1--- ---- function
1000 ----   core norm (5 bit functn address)
1010 ----   core immediate (4 bit f address)
1011 ----   core condition (4 bit f address)
1001 ----   colon norm
1110 ----   colon immediate
1111 ----   colon condition
110- ---- strings, floats, ints,
0--- ---- tiny int
*/
export enum DataType {
    fn_core_norm = 128,
    fn_core_immediate = 129,
    fn_core_condition = 130,
    fn_colon_norm = 131,
    fn_colon_immediate = 132,
    fn_colon_condition = 133,
    ptr_address = 134,
    float = 135,
    integer = 136,
    string = 137,
    uninit = 255,
    tiny_int = 0, // 7 bits
}
