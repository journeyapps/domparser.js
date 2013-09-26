xdescribe('benchmarks', function() {
    var suite = new Benchmark.Suite();

    var smallDoc = '<view title="Demo" native="Sidebar"></view>';

    // about 4kb in size
    var mediumDoc = window.__html__['test/medium.xml'];

    // about 100kb in size
    var largeDoc = window.__html__['test/large.xml'];



    function nativeParse(text) {
        var doc = new DOMParser().parseFromString(text, 'text/xml');
    }

    function domparserParse(text, position) {
        var doc = new domparser.DOMParser({ position: position }).parseFromString(text);
    }

    function saxParse(text, position) {
        var parser = sax.parser(true, {xmlns: true, position: position});
        parser.write(text).close();
    }

    // Benchmarks


    suite.add('small - native', function() {
        nativeParse(smallDoc);
    });

    suite.add('small - sax', function() {
        saxParse(smallDoc);
    });
    
    suite.add('small - domparser', function() {
        domparserParse(smallDoc, false);
    });


    suite.add('medium - native', function() {
        nativeParse(mediumDoc);
    });

    suite.add('medium - sax', function() {
        saxParse(mediumDoc, false);
    });

    suite.add('medium - sax with position', function() {
        saxParse(mediumDoc, true);
    });


    suite.add('medium - domparser', function() {
        domparserParse(mediumDoc, false);
    });

    suite.add('medium - domparser with position', function() {
        domparserParse(mediumDoc, true);
    });
    
    suite.add('large - native', function() {
        nativeParse(largeDoc);
    });

    suite.add('large - sax with position', function() {
        saxParse(largeDoc, true);
    });

    suite.add('large - domparser', function() {
        domparserParse(largeDoc, false);
    });
    suite.add('large - domparser with position', function() {
        domparserParse(largeDoc, true);
    });
    
    // Some results on Chrome:
//    'small - native x 27,176 ops/sec ±5.39% (84 runs sampled)'
//    'small - sax x 13,803 ops/sec ±9.52% (94 runs sampled)'
//    'small - domparser x 5,248 ops/sec ±15.65% (83 runs sampled)'

//    'medium - native x 2,770 ops/sec ±0.55% (95 runs sampled)'
//    'medium - sax x 262 ops/sec ±19.69% (91 runs sampled)'
//    'medium - sax with position x 271 ops/sec ±0.84% (88 runs sampled)'
//    'medium - domparser x 146 ops/sec ±5.10% (73 runs sampled)'
//    'medium - domparser with position x 120 ops/sec ±6.43% (66 runs sampled)'

//    'large - native x 228 ops/sec ±0.62% (86 runs sampled)'
//    'large - sax with position x 17.73 ops/sec ±1.61% (48 runs sampled)'
//    'large - domparser x 11.66 ops/sec ±7.14% (34 runs sampled)'
//    'large - domparser with position x 9.69 ops/sec ±10.37% (29 runs sampled)'



    // print results for each test
    suite.on('cycle', function(event) {
        console.log(event.target.toString());
    });

    var complete = false;

    suite.on('complete', function(event) {
        complete = true;
    });

    it('runs benchmarks', function() {
        suite.run({ 'async': true });

        waitsFor(function() {
            return complete;
        }, 'timeout', 600000);
    });

});