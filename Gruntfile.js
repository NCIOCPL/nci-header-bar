module.exports = function(grunt) {


    var target = grunt.option('target') || 'dist';

    var config = {
        dirs: {
            src: {
                base: "src/",
                modules: "src/modules/",
            },
            tmp: {
                base: "_tmp/",
                modules: "_tmp/modules/"
            },
            dist: {
                base: target + "/",
                modules: target + "/modules/",
            },
            bower: 'bower_components/'
        },
        fingerprint: Date.now(),
        env: 'dev'
    };

    // Load Plugins
    require('load-grunt-config')(grunt,{
        data: config
    });

    // ----------------------------------------------------------------
    // Tasks
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    grunt.registerTask('build-styles', 'Build the CSS.', function(env) {
        env = (env === 'prod' ? 'prod' : 'dev');
        grunt.config('env', env);

        var tasks = ['sass:' + env,
            'copy:styles',
            'clean:tmp'];
        grunt.task.run(tasks);
    });


    

    // ----------------------------------------------------------------
    grunt.registerTask('build', 'Build all files.', function (env) {
        env = (env === 'prod' ? 'prod' : 'dev');
        grunt.config('env', env);

        var tasks = [
//            'generate-config:' + env,
//            'build-styles:' + env,
//            'uglify:' + env,
//            'copy:scripts',
//            'clean:tmp',
//            'build-templates:' + env,
//            'build-xsl',
//            'build-images',
//            'build-files',
//            'copy-fonts',
//            'webpack:' + env
        ];

        grunt.task.run(tasks);
    });

    grunt.registerTask('build-watch', 'Proxy header', function(host) {
        var useHttps = true;

        //Assume env is dev.  Should make sure built files work too...
        var env = dev;

        config.env = env;

        grunt.config('env', env);
        grunt.config.merge({
            develop: {
                server: {
                    dev: {
                        PROXY_ENV: host,
                        PROXY_HTTPS: useHttps
                    }
                }
            }
        });

        var tasks = [
            'build:' + env,
            'develop',
            'watch'
        ];

        grunt.task.run(tasks);
    })

    // We should ALWAYS define the 'default' task
    grunt.registerTask('default', ['build']);
    
    // Deploy task is used by the build script
    grunt.registerTask('deploy', ['build:prod']);

};