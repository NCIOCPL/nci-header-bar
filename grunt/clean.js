/*****************************************
 *  Cleaning
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
    return {
        tmp: {
            src: [dirs.tmp.base]
        },
        dist: {
            src: [dirs.dist.base]
        }
    }
};