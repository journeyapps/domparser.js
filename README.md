# domparser

This is a pure JS implementation of DOM parsing, to be used instead of DOMParser in a browser. We use [sax.js](https://github.com/isaacs/sax-js/) for
the low-level parsing, and convert it to the browser's native Document object, or xmldom.

## Why not use the built-in DOMParser?

The built-in DOMParser in modern browsers should be sufficient for most use cases, and has very good performance. However, it does have some limitations:

1. Error reporting is very different on the different browsers. The browser typically stops after the first error.
2. It's not possible to get access to position info (what line/column an element is on).

This project aims to be a lightweight replacement for the built-in parser, with better error handling and position
reporting.

## Usage

    const { DOMParser } = require('@journeyapps/domparser');
    var doc = new DOMParser().parseFromString("<test>xml</test>");

## Supported environments

Should work on any browser that supports ES6.

Tested on recent versions of Node, Chrome and Firefox.

When running in Node, a recent version of xmldom is required.

# License

All files in this project are licensed under the MIT license.
