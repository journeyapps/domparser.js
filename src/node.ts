import { setImplementation, setParsers } from './xmldom';

export * from './index';

const xmldom = require('xmldom');

setImplementation(new xmldom.DOMImplementation());
setParsers(xmldom);
