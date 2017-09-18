/*****************************************
 * Uglify JS
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
    var files = {
        expand: true,
        flatten: true,
        dest: dirs.tmp.base + '**/*.js',
        src: [dirs.src.base + '**/*.js']
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
            files: [files]
        }
    }
};