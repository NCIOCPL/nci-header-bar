/*****************************************
 * Uglify JS
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
    var pkg = grunt.file.readJSON('package.json');

    var files = {
        expand: true,
        cwd: dirs.src.base,
        src: ["**/*.js"],
        dest: dirs.dist.base,
        ext: '.js'
    };
    return {
        options: {
            preserveComments: 'some',
            maxLineLen: 500
        },

        dev: {
            options: {
                mangle: false,
                beautify: true,
                sourceMap: true
            },
            files: [files]
        },
        prod: {
            options: {
                mangle: true
            },
            files: [{
                expand: true,
                src: ["**/*.js"],
                dest: dirs.dist.base,
                cwd: dirs.src.base,
                rename: function (dst, src) {
                    // To keep the source js files and make new files as `*.min.js`:
                    // return dst + '/' + src.replace('.js', '.min.js');
                    // Or to override to src:
                    //return src;

                    var module;
                    var version = pkg.version;
                    for (module in pkg.modules) {
                        //check if path contains a module name
                        if(src.match(module)){
                            // assign the version number for that module
                            version = pkg.modules[module].version;
                        }
                    }
                    return dst + '/' + src.replace('.js', '.v' + version + '.min.js');
                }
            }]
        }
    }
};