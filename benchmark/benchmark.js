'use strict';

// Adapted from fxp's benchmark

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite('XML Parser benchmark');

const { DOMParser } = require('..');
const xmldom = require('xmldom');
const fxp = require('fast-xml-parser');

const fs = require('fs');
const path = require('path');
const sample1 = fs.readFileSync(path.join(__dirname, './sample.xml'), 'utf-8');
const sample2 = fs.readFileSync(path.join(__dirname, './sample2.xml'), 'utf-8');

suite
  .add('small - domparser', function () {
    new DOMParser().parseFromString(sample1);
  })
  .add('small - xmldom', function () {
    new xmldom.DOMParser().parseFromString(sample1);
  })
  .add('small - fxp', function () {
    fxp.parse(sample1);
  })
  .add('large - domparser', function () {
    new DOMParser().parseFromString(sample2);
  })
  .add('large - xmldom', function () {
    new xmldom.DOMParser().parseFromString(sample2);
  })
  .add('large - fxp', function () {
    fxp.parse(sample2);
  })

  .on('start', function () {
    console.log('Running Suite: ' + this.name);
  })
  .on('error', function (e) {
    console.log('Error in Suite: ' + this.name);
  })
  .on('abort', function (e) {
    console.log('Aborting Suite: ' + this.name);
  })
  .on('complete', function () {
    for (let j = 0; j < this.length; j++) {
      console.log(this[j].name + ' : ' + this[j].hz + ' requests/second');
    }
  })
  // run async
  .run({ async: true });
