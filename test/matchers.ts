import * as native from '../src/xmldom';
import 'jasmine';

beforeEach(function() {
  function nodeToString(node) {
    return new native.XMLSerializer().serializeToString(node);
  }

  function normalizeProp(value) {
    if (value == null) {
      return '';
    } else {
      return value;
    }
  }

  function findDifference(actual, expected) {
    if (native.isEqualNode(actual, expected)) {
      return null;
    }

    const properties = [
      'nodeType',
      'nodeName',
      'localName',
      'namespaceURI',
      'prefix',
      'nodeValue'
    ];
    for (let property of properties) {
      if (
        normalizeProp(actual[property]) != normalizeProp(expected[property])
      ) {
        return `${property} is different: ${actual[property]} != ${expected[property]}`;
      }
    }

    if (nodeToString(actual) != nodeToString(expected)) {
      return 'string repr different';
    }

    if (actual.hasChildNodes()) {
      if (actual.childNodes.length != expected.childNodes.length) {
        return 'Different number of children';
      }

      for (var i = 0; i < actual.childNodes.length; i++) {
        var childA = actual.childNodes[i];
        var childB = expected.childNodes[i];
        var diff = findDifference(childA, childB);
        if (diff != null) {
          return diff;
        }
      }
    }

    return 'just different: ' + nodeToString(actual);
  }

  jasmine.addMatchers({
    toEqualNode(_util, _customEqualityTesters) {
      return {
        compare(actual, expected): jasmine.CustomMatcherResult {
          var result: jasmine.CustomMatcherResult = {
            pass: native.isEqualNode(actual, expected)
          };
          const difference = findDifference(actual, expected);
          let extra = ' (no idea where)';
          if (difference) {
            extra = ' (' + difference + ')';
          }

          if (result.pass) {
            result.message =
              'Expected node ' +
              nodeToString(actual) +
              ' not to equal node ' +
              nodeToString(expected);
          } else {
            result.message =
              'Expected node ' +
              nodeToString(actual) +
              ' to equal node ' +
              nodeToString(expected) +
              extra;
          }
          return result;
        }
      };
    }
  });
});
