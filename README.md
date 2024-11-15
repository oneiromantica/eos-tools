 Tools for EOS tease authors.
 
 You install them by copy-pasting the file contents from the [/dist](/dist)
folder into your init script, either directly from github or compile them
yourself for maximum trust.

``` shell
npm ci
npm run build
```

`

# BaseConvert.js

Convert numbers to strings that require less space to save.

``` typescript
BaseConvert.encode: (_: _number) => string
BaseConvert.decode: (_: _string) => number
```

**Rationale:** Change the base to 64.

# BitField.js

Store a great number of booleans in a small amount of numbers.
Using that module will also make `BaseConvert` available, don't use both!

``` javascript
BitField.of: (size: _number) => BitField // Create a bit field to store `size` booleans, idx ∈ [0,..,size-1]
BitField.getAt: (idx: number, _: BitField) => boolean // Is bit #idx set?
BitField.setAt: (idx: number, _: BitField) => BitField // Set bit #idx to `true`
BitField.clearAt: (idx: number, _: _BitField) => BitField // Set bit #idx to `false`
BitField.count: (_: _BitField) => number // Get number of bits set to `true`
BitField.toBase65: (_: BitField) => string // Serialise to a string
BitField.fromBase65: (_: string) => BitField // Read a stringified bit field, e.g. from storage
```

**Rationale:** Bit-shift numbers into buckets, each bucket can hold values of
0-64, so we can use BaseConvert to store 6 booleans per character/byte.

# lz.js

Hand-picks `compressToBase64` and `decompressFromBase64` from
[pieroxy/lz-string](https://github.com/pieroxy/lz-string) and transpiles them
until EOS's sandbox can evaluate them without throwing errors.

Exposes the namespace `window.lz` with two functions:

``` typescript
lz.compress: (_: string) => string; // it... well, compresses the string
lz.uncompress: (_: string) => string // Uncompreses the input string
```

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
    
``` typescript

// Create a namespace closure that remembers variable names and ordering
State: (
  initial: Record<string, number | boolean | string | BitField, // var names to manage and their initial values
  options?: {compress: (_: string) => string, uncompress: (_: string) => string} // Optional further compressen, you can pass e.g. `lz`
) => State

// Once we have created a state (we'll call it `state` from now on), we can use its functions 

// Mutate the target by writing all initial values to its keys. You'll usually want `target` to be `window`.
state.init: (target: Record<string, any>) => void;

// Parse a given serialised save string and returns a game state as described by `initial` on creation
// Parsing will automatigally uncompress when an `uncompress`-option was given
state.parse: (serialized: string) => Record<string, number | boolean | string | BitField>

// Parse a serialised save string and mutate `target` by overwriting all described game variables
// Parsing will automatigally uncompress when an `uncompress`-option was given
state.hydrate: (serialized: string, target: Record<string, any>) => void

// Extract all game variables from an object and serialise them into a string
// Will automaticall use compression when a `compress`-option was given
state.serialize: (target: Record<string, any>) => string
```

Of course, due to the type signature you can give arbitrary string processing
functions as un-/compress options. They will be applied serialisin and before
parsing respectively.

## Full example

``` javascript
var initialState = { health: 100, died: false, seenPages: BitField.of(100) }; 
var state = State(initialState);
// Or, if you want to add lz4 compression
var state = State(initialState, lz);

// Reset initial state:
state.initialize(window); // Now all variables are available globally

// Loading/saving, call these from some pages
function saveGame() {
  var toSave = state.serialize(window);
  teaseStorage.setItem('save', toSave);
}

function loadGame() {
  var saved = teaseStorage.getItem('save');
  if (saved) {
    state.hydrate(window, saved);
    // New game variables appended since saving will be set to their initial values
  } 
}
```
