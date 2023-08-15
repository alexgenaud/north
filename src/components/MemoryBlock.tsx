import { DataBlock } from "../../TypeScript/north/types";

interface Prop {
  block: DataBlock;
}

function MemoryBlock(prop: Prop) {
  const { address, type, value, size } = prop.block;
  const colspanClass = size < 2 ? "" : "col-span-" + size + " ";
  const isHex = true;
  const adrHex = numToHex(address, isHex);
  const convertVal = convertString(value, isHex);
  const addressColor: number = (address + 2560) as number; // will be MOD 128 or 256, etc
  const valueColor: number = isNaN(Number(value))
    ? addressColor
    : Number(value);
  return (
    <div className={`${colspanClass} memory-block`}>
      <div
        key={`adr-${address}`}
        className="text-adr"
        style={byteToBgColor(addressColor)}
      >
        {adrHex} {type}
      </div>
      <div
        key={`val-${address}`}
        className="text-word"
        style={byteToBgColor(valueColor)}
      >
        {convertVal}
      </div>
    </div>
  );
}

export default MemoryBlock;

function convertString(str: string | number, isHex: boolean): string {
  if (!isNaN(Number(str))) return numToHex(Number(str), isHex);
  if (str.length <= 8) return str;
  return str.slice(0, 6) + "...";
}

function numToHex(num: number, isHex: boolean): string {
  if (isNaN(Number(num))) return "X";
  if (!isHex) return num + "";
  return num.toString(16).toUpperCase().padStart(2, "0"); // HEX
}

function byteToBgColor(i8Byte: number) {
  if (i8Byte == 0) return { backgroundColor: "hsl(0, 50%, 80%)" };
  const i8to360 = Math.floor((2 * 1.406 * (i8Byte % 256)) % 360);
  return { backgroundColor: "hsl(" + i8to360 + ", 100%, 70%)" };
}
