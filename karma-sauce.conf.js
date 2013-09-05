module.exports = function(config) {
    config.set({
        basePath: '',

        preprocessors: {
        },

        files: [
            'vendor/sax.js',
            'domparser.js',

            'test/matchers.js',
            'test/*.js'
        ],

        frameworks: ['jasmine'],

        // web server port
        port: 8080,

        // cli runner port
        runnerPort: 9100,

        hostname: '127.0.1.1',

        // This speeds up the capturing a bit, as browsers don't even try to use websocket.
        transports: ['xhr-polling'],

        autoWatch: false,
        singleRun: true,

        colors: true,

        reporters: ['dots'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 10000,

        sauceLabs: {
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            startConnect: false,
            testName: 'domparser'
        },

        // define SL browsers
        customLaunchers: {
            'SL_Chrome': {
                base: 'SauceLabs',
                browserName: 'chrome'
            },
            'SL_Firefox': {
                base: 'SauceLabs',
                browserName: 'firefox'
            },
            'SL_Safari': {
                base: 'SauceLabs',
                browserName: 'safari',
                platform: 'Mac 10.8',
                version: '6'
            },
            'SL_IE_8': {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 7',
                version: '8'
            },
            'SL_IE_9': {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 2008',
                version: '9'
            },
            'SL_IE_10': {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 2012',
                version: '10'
            }
        },

        browsers: ['SL_IE_9', 'SL_IE_10']
    });
};
