# Is Valid US ZIP

A "small" library for checking if a US 5 Digit ZIP code is real.

# Install

```
npm install is-valid-us-zip
```

# Usage 

```js
const isValidUSZip = require('is-valid-us-zip');

isValidUSZip("75000") // false
```

The function will return false for a value that is not a stirng. As you can't reference some zip codes as a number, due to the starting with a 0.

# Building 

Download a copy of the `AREADIST_ZIP5.TXT` file from USPS and pipe it into the tree builder script.

```
$ cat AREADIST_ZIP5.TXT | node build/make-tree.js
```

# Data Source

 - https://postalpro.usps.com/address-quality/ais-viewer - AREADIST_ZIP5.TXT