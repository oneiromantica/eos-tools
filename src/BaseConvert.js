export const BaseConvert = (
  digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+*/",
) => {
  const _digits = digits.split("");
  const L = digits.length;
  const valueOf = _digits.reduce((acc, digit, idx) => {
    acc[digit] = idx;
    return acc;
  }, {});
  const encode = (n) => {
    if (n === 0) return _digits[0];
    let result = "";
    while (n > 0) {
      result = _digits[n % L] + result;
      n = Math.floor(n / L);
    }
    return result;
  };
  const decode = (str) => {
    let res = 0;
    const length = str.length;
    let char = -1;
    for (let i = 0; i < length; i++) {
      char = valueOf[str.charAt(i)];
      res += char * Math.pow(L, length - i - 1);
    }
    return res;
  };
  return {
    encode: (n) => (n < 0 ? "-" + encode(-n) : encode(n)),
    decode: (str) =>
      str[0] === "-" ? -1 * decode(str.substring(1)) : decode(str),
  };
};

window && (window.BaseConvert = BaseConvert());
export default BaseConvert();
