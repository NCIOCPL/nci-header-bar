module.exports = function(grunt) {


    var target = grunt.option('target') || 'dist';
    var proxyhost = grunt.option('proxyhost') || 'www.cancer.gov';
    var cssSitename = grunt.option('css-sitename') || 'global';

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


    grunt.registerTask('build-js', 'Packages the JS files', function(env) {
        env = (env === 'prod' ? 'prod' : 'dev');
        grunt.config('env', env);
        
        var tasks = [
            'uglify:' + env,
            'copy:scripts',
            'clean:tmp'];
        grunt.task.run(tasks);                
    });

    // ----------------------------------------------------------------
    grunt.registerTask('build', 'Build all files.', function (env) {
        env = (env === 'prod' ? 'prod' : 'dev');
        grunt.config('env', env);

        var tasks = [
            'build-styles:' + env,
            'build-js:' + env,
            'clean:tmp',
        ];

        grunt.task.run(tasks);
    });    

    grunt.registerTask('build-watch', 'Proxy header', function(env) {
        var useHttps = true;

        config.env = env;

        grunt.config('env', env);
        grunt.config.merge({
            develop: {
                server: {
                    env: {
                        PROXY_ENV: proxyhost,
                        PROXY_HTTPS: useHttps,
                        CSS_SITENAME: cssSitename
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