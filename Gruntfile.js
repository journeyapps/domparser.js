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
                configFile: 'karma-sauce.conf.js'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'karma:unit']);
    grunt.registerTask('ci', ['jshint', 'karma:ci']);

};
