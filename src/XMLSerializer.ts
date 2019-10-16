import * as native from './xmldom';
import { XMLNode, XMLNodeLike } from './XMLNode';
import { DOCUMENT_NODE, PROCESSING_INSTRUCTION_NODE, TEXT_NODE } from '.';

function nativeSerializeToString(node) {
  return new native.XMLSerializer().serializeToString(node);
}

export class XMLSerializer {
  serializeToString(anyNode: XMLNodeLike) {
    const node = anyNode as XMLNode;
    // Whitespace characters between processing instructions are lost, and browsers serialize them differently.
    // We write these individually, and include newline characters in between them.
    // Note that our DOMParser is the only one that saves the processing instructions in the DOM, browsers don't do this.
    if (
      node.nodeType == DOCUMENT_NODE &&
      node.firstChild &&
      node.firstChild.nodeType == PROCESSING_INSTRUCTION_NODE
    ) {
      var children = node.childNodes;
      var result = '';
      for (var i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType == TEXT_NODE) {
          // Workaround for xmldom inserting extra newlines
          continue;
        }
        const part = nativeSerializeToString(children[i]);
        result += part;
        if (i != children.length - 1) {
          result += '\n';
        }
      }
      return result;
    } else {
      return nativeSerializeToString(node);
    }
    // TODO: if it is a document without any processing instructions, generate one ourselves
    // Something like this: <?xml version="1.0" encoding="UTF-8"?>
  }
}
