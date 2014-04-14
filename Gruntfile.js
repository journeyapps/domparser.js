module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration.
        jshint: {
            options: {
                eqnull: true,
                browser: true
            },
            gruntfile: {
                src: 'Gruntfile.js',
                options: {
                    globals: {
                        module: false
                    }
                }
            },
            module: {
                src: 'domparser.js'
            },
            test: {
                src: 'test/**/*.js'
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            unit: {

            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS', 'Firefox'],
                reporters: 'dots'
            },
            sauce: {
                configFile: 'karma-sauce.conf.js',
                browsers: ['SL_IE_9', 'SL_IE_10', 'SL_Chrome', 'SL_Safari']
            },
            ios: {
                // Not reliable.
                configFile: 'karma-sauce.conf.js',
                browsers: ['SL_IPHONE']
            }
        }
    });

    // Default task.
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('ci', ['jshint', 'karma:ci']);

};
