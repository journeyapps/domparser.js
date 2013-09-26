module.exports = function(config) {
    config.set({
        basePath: '',

        preprocessors: {
            '**/*.xml': ['html2js']
        },

        files: [
            'test/*.xml',

            'vendor/sax.js',
            'vendor/benchmark.js',
            'domparser.js',

            'test/matchers.js',
            'test/*.js'
        ],

        frameworks: ['jasmine'],

        // web server port
        port: 8080,

        // cli runner port
        runnerPort: 9100,

        autoWatch: true,

        colors: true,

        reporters: ['progress'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 10000,

        // Use PhantomJS by default - allow the tests to be run without a browser window. Can also use any of the following
        // if you don't want to install PhantomJS, or want to test the code in a specific browser:
        //  * Chrome
        //  * ChromeCanary
        //  * Safari
        //  * Firefox
        //  * Opera
        //
        // For more details, see https://testacular.readthedocs.org/en/latest/user/browsers/
        browsers: ['Chrome']
    });
};
