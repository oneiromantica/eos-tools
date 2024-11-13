import { compressToBase64 } from "../lz-string/src/base64/compressToBase64";
import { decompressFromBase64 } from "../lz-string/src/base64/decompressFromBase64";
const lz = { compress: compressToBase64, uncompress: decompressFromBase64 };
window.lz = lz;
export default lz;
