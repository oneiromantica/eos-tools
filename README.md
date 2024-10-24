Tools for EOS tease authors.

# BaseConvert.js

Convert numbers to strings that require less space to save.

``` javascript
BaseConvert.encode(number) -> string
BaseConvert.decode(string) -> number
```

**Rationale:** Change the base to 64.

# BitField.js

Store a great number of booleans in a small amount of numbers.
Using that module will also make `BaseConvert` available, don't use both!

``` javascript
BitField.of(number) -> BitField // Create a bit field to store `size` booleans, idx ∈ [0,..,size-1]
BitField.getAt(number, BitField) -> boolean // Is bit #idx set?
BitField.setAt(number, BitField) -> BitField // Set bit #idx to `true`
BitField.clearAt(number, BitField) -> BitField // Set bit #idx to `false`
BitField.count(BitField) -> number // Get number of bits set to `true`
BitField.toBase65(BitField) -> string // Stringify the bit field to store it
BitField.fromBase65(string) -> BitField // Read a stringified bit field, e.g. from storage
```

**Rationale:** Bit-shift numbers into buckets, each bucket can hold values of
0-64, so we can use BaseConvert to store 6 booleans per character/byte.

# GameState.js

A key-value manager that serializes to tiny game states. Can serialize an
in-game state from Trials of the Succubi (295 variables at this point in time)
to ~250 bytes; down to 104 bytes with lz-compression.

It also makes `BaseConvert` and `BitField` available.

## Pros

- Optional compression can be chosen by the user
- Variables can be renamed after serialization, won't matter as long as they stay in order
- States can be extended with additional variables

## Limitations

- Only stores *integer* numbers, strings, booleans, bit fields
- Stores only values that exist in the initial config object
- Game variables *must* have a valid value. `null` or `undefined` will break
  compression

**Rationale:**

- Store value-groups by type
- Encode numbers to Base65
- Encode booleans as bit field
- Don't store value names, depend on the order of the initial state instead
  - Variables can be safely renamed, as long as they stay in the
    same order
  - New variables can be added, as long as they are added after existing ones.
    In this case, you need to make sure they get applied during state load.

``` javascript
var initialState = { health: 100, died: false, seenPages: BitField.of(100) }; 
var state = State(initialState)

// Reset initial state:
state.initialize(window); // Now all variables are available globally

// Loading/saving
function saveGame() {
  var toSave = state.serialize(window);
  teaseStorage.setItem('save', toSave);
}

function loadGame() {
  var saved = teaseStorage.getItem('save');
  if (saved) {
    state.initialize(window);       // Reset all values to initial and create new values since last update
    state.hydrate(window, saved); // Overwrites all variables in the first argument
  } 
}
```

It also offers `state.parse(string)` to just read and validate a serialized game
state.

## Optional compression (advanced)

If you need more compression you can include any function that accepts one
string parameter and returns a string. You might want to have a look at the
`lz-string` library for that.

``` javascript
var state = State(initialState, {compress: lz.compressToBase64, uncompress: lz.decompressFromBase64});
```

...and that's all, your state will automatically apply compression when (de-)serializing a save game.
