import { compressToBase64, decompressFromBase64 } from "lz-string";
const lz = { compress: compressToBase64, uncompress: decompressFromBase64 };
window.lz = lz;
export default lz;
