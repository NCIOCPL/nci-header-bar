/*****************************************
 *  Watch
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
    return {
        css: {
            files: [dirs.src.base + '**/*.scss'],
            tasks: ['build-styles:' + 'dev']
        },
        js: {
            files: [dirs.src.base + '**/*.js'],
            tasks: ['build-js:' + 'dev']
        }
    }
};