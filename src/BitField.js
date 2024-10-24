import Base65 from "./BaseConvert";

const assert = (typename, test) => (value) => {
  if (!test(value))
    throw new Error(
      `Expected [${typename}], received ${typeof value} ${JSON.stringify(value)}`,
    );
};

const isNaturalNumber = (x) => typeof x === "number" && x >= 0;

const assertIsNaturalNumber = assert("integer >= 0", isNaturalNumber);

export const BitFieldBase = (L = 6) => {
  const idces = [...Array(L)].map((_, idx) => 1 << idx);
  const isBitField = (x) =>
    Array.isArray(x) &&
    x.every((field) => typeof field === "number") &&
    x.length > 0;
  const getCoords = (n, bits) => {
    assertIsNaturalNumber(n);
    assert("input is bit field", isBitField)(bits);
    const nMax = bits.length * L - 1;
    assert("address is number between 0 and " + nMax, (x) => x <= nMax)(n);
    const bucket = Math.floor(n / L);
    const index = n % L;

    return [bucket, index];
  };
  const getAtCoords = (bucket, index, bits) =>
    bits[bucket] & idces[index] ? true : false;
  const getAt = (n, bits) => {
    const [bucket, index] = getCoords(n, bits);
    return getAtCoords(bucket, index, bits);
  };
  const setAt = (n, bits) => {
    const [bucket, index] = getCoords(n, bits);
    return bits.map((b, idx) => (idx === bucket ? b | idces[index] : b));
  };
  const clearAt = (n, bits) => {
    const [bucket, index] = getCoords(n, bits);
    const isSet = getAtCoords(bucket, index, bits);
    return isSet
      ? bits.map((b, idx) => (idx === bucket ? b ^ idces[index] : b))
      : bits;
  };
  const of = (nFlags) => {
    assertIsNaturalNumber(nFlags);
    const spaces = Math.max(Math.floor((nFlags - 1) / L) + 1, 1);
    return [...Array(spaces)].map((_) => 0);
  };
  const toBase65 = (bits) => {
    const encoded = bits.map(Base65.encode);
    return L < 7 ? encoded.join("") : encoded.join(",");
  };
  const fromBase65 = (str) =>
    (L < 7 ? str.split("") : str.split(",")).map(Base65.decode);
  const count = (bits) => {
    const l = bits.length * L;
    let setBits = 0;
    for (let i = 0; i < l; i++) if (getAt(i, bits)) setBits++;
    return setBits;
  };
  return { of, getAt, setAt, clearAt, toBase65, fromBase65, count };
};

window && (window.BitField = BitFieldBase());
export default BitFieldBase();
