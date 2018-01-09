module.exports = function(grunt) {


    var target = grunt.option('target') || 'dist';
    var proxyhost = grunt.option('proxyhost') || 'www.cancer.gov';
    //var cssSitename = grunt.option('css-sitename') || 'global';

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

        var tasks = ['sass:' + env];
        grunt.task.run(tasks);
    });


    grunt.registerTask('build-js', 'Packages the JS files', function(env) {
        env = (env === 'prod' ? 'prod' : 'dev');
        grunt.config('env', env);
        
        var tasks = ['uglify:' + env];
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

    grunt.registerTask('dtm-proxy', 'Proxy using DTM', function(env) {
        var useHttps = true;

        var dtm_property_id = grunt.option('dtm-property-id');
        //The assumption is that this is the company id, it does not change across properties.
        var dtm_company_id = grunt.option('dtm-company-id') || 'f1bfa9f7170c81b1a9a9ecdcc6c5215ee0b03c84';

        //Should we strip out WA_XXXX_Pageload tag from content so analytics come from DTM
        var remove_analytics = grunt.option('remove-analytics');

        if (dtm_property_id == "") {
            grunt.fail.error("--dtm-property-id is required");
        }
        
        grunt.config('env', env);
        grunt.config.merge({
            develop: {
                server: {
                    file: './server/dtm-proxy.js',
                    env: {
                        DTM_PROPERTY_ID: dtm_property_id,
                        DTM_COMPANY_ID: dtm_company_id,
                        PROXY_ENV: proxyhost,
                        PROXY_HTTPS: useHttps,
                        REMOVE_ANALYTICS: remove_analytics
                        
                    }
                }
            }            
        })

        grunt.task.run(['develop', 'watch']);

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
                        PROXY_HTTPS: useHttps
                        // ,
                        // CSS_SITENAME: cssSitename
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
    });

    // We should ALWAYS define the 'default' task
    grunt.registerTask('default', ['build']);
    
    // Deploy task is used by the build script
    grunt.registerTask('deploy', ['build:prod']);

};