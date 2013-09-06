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
            sauce1: {
                configFile: 'karma-sauce.conf.js',
                browsers: ['SL_IE_9', 'SL_IE_10']
            },
            sauce2: {
                configFile: 'karma-sauce.conf.js',
                browsers: ['SL_IPHONE', 'SL_Safari']
            }
        }
    });

    // Run multiple tests serially, but continue if one of them fails.
    // Adapted from http://stackoverflow.com/questions/16487681/gruntfile-getting-error-codes-from-programs-serially
    grunt.registerTask('serialsauce', function() {
        var done = this.async();
        var tasks = {'karma:sauce1': 0, 'karma:sauce2': 0};
        var success = true;
        grunt.util.async.forEachSeries(Object.keys(tasks), function(task, next) {
            grunt.util.spawn({
                grunt: true,  // use grunt to spawn
                args: [task], // spawn this task
                opts: { stdio: 'inherit' } // print to the same stdout
            }, function(err, result, code) {
                tasks[task] = code;
                if(code !== 0) {
                    success = false;
                }
                next();
            });
        }, function() {
            done(success);
        });
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'karma:unit']);
    grunt.registerTask('ci', ['jshint', 'karma:ci']);

};
