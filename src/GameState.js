import BitField from "./BitField";

const State = (
  initial,
  { compress = (x) => x, uncompress = (x) => x } = {},
) => {
  const Base65 = BaseConvert();
  const getKeysOfType = (typeName) =>
    Object.keys(initial).filter((key) => typeof initial[key] === typeName);
  const boolValues = getKeysOfType("boolean");
  const numberValues = getKeysOfType("number");
  const stringValues = getKeysOfType("string");
  const bitFields = Object.keys(initial).filter((key) =>
    Array.isArray(initial[key]),
  );
  const fieldSeparator = "|";
  const groupSeparator = "$";

  const mergeObj = (a, b) => {
    const result = {};
    Object.keys(a).forEach((key) => (result[key] = a[key]));
    Object.keys(b).forEach((key) => (result[key] = b[key]));
    return result;
  };

  const compressBools = (store) => {
    const boolField = boolValues.reduce(
      (bf, key, idx) =>
        store[key] ? BitField.setAt(idx, bf) : BitField.clearAt(idx, bf),
      BitField.of(boolValues.length),
    );
    return BitField.toBase65(boolField);
  };
  const serializeStrings = (store) =>
    stringValues.map((key) => store[key]).join(fieldSeparator);
  const serializeNumbers = (store) =>
    numberValues.map((key) => Base65.encode(store[key])).join(fieldSeparator);
  const serializeBitFields = (store) =>
    bitFields.map((key) => BitField.toBase65(store[key]));
  const parseBools = (str) => {
    const bools = BitField.fromBase65(str);
    return boolValues.reduce((acc, key, idx) => {
      acc[key] = BitField.getAt(idx, bools);
      return acc;
    }, {});
  };
  const parseValues = (keys, fromString) => (str) =>
    str.split(fieldSeparator).reduce((acc, stringVal, idx) => {
      acc[keys[idx]] = fromString(stringVal);
      return acc;
    }, {});
  const parseStrings = parseValues(stringValues, (x) => x);
  const parseNumbers = parseValues(numberValues, Base65.decode);
  const parseBitFields = parseValues(bitFields, BitField.fromBase65);

  const serialize = (store) =>
    compress(
      serializeNumbers(store) +
        groupSeparator +
        serializeStrings(store) +
        groupSeparator +
        compressBools(store) +
        groupSeparator +
        serializeBitFields(store),
    );
  const parse = (str) => {
    const [numbers, strings, bools, bitFields] =
      uncompress(str).split(groupSeparator);
    return [
      parseNumbers(numbers),
      parseStrings(strings),
      parseBools(bools),
      parseBitFields(bitFields),
    ].reduce(mergeObj, {});
  };
  const overwriteM = (target, value) => {
    Object.keys(value).forEach((k) => {
      if (value[v] !== null && value[v] !== undefined && target[k] !== value[v])
        target[k] = value[v];
    });
  };
  return {
    parse,
    initialize: (store) => void overwriteM(store, initial),
    hydrate: (store, compressedState) =>
      void overwriteM(store, parse(compressedState)),
    serialize,
  };
};

window && (window.State = State);
export default State;
