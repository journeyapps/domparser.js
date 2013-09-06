# domparser

This is a pure JS implementation of DOM parsing, to be used instead of DOMParser in a browser. We use [sax.js] for
the low-level parsing, and convert it to the browser's native Document object.

## Why not use the built-in DOMParser?

The built-in DOMParser in modern browsers should be sufficient for most use cases. The missing features I've found:

1. Error reporting is very different on the different browsers. Typically the browser also stops after the first error.
2. It's not possible to get access to position info (what line/column an element is on).

This project aims to be a lightweight replacement for the built-in parser, with better error handling and position
reporting.

## Usage

    var doc = new domparser.DOMParser().parseFromString("<test>xml</test>");

## Supported browsers

Tested on recent versions of Chrome, Firefox and Safari, and on IE 9 and 10. Does not work on IE 8 and below.

Tested with the help of [Travis](https://travis-ci.org/embarkmobile/domparser.js) and [SauceLabs](https://saucelabs.com/u/rkistner).

[![Build Status](https://travis-ci.org/embarkmobile/domparser.js.png?branch=master)](https://travis-ci.org/embarkmobile/domparser.js)

# License

All files in this project are under the MIT license.
