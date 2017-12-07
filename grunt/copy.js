/*****************************************
 *  Copying
 ****************************************/

module.exports = function (grunt, options) {
    var dirs = options.dirs;
    return {
        styles: {
            nonull: true,
            files: [{
                expand: true,
                flatten: true,
                src: [
                    dirs.tmp.base + '**/*.css',
                    dirs.tmp.base + '**/*.css.map'
                ],
                dest: dirs.dist.base,
                filter: 'isFile'
            }]
        },
        scripts: {
            nonull: true,
            files: [{
                expand: true,
                flatten: true,
                src: [
                    dirs.tmp.base + '**/*.js',
                    dirs.tmp.base + '**/*.js.map'
                ],
                dest: dirs.dist.base,
                filter: 'isFile'
            }]            
        }
    }
};