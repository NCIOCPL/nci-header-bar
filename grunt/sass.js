/*****************************************
 *  SASS Preprocessing
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
    var pkg = grunt.file.readJSON('package.json');
  
      var path = require('path'),
          fs = require('fs'),
          crypto = require('crypto');
  
    // create an array of all the folders under /src/modules
    var Modules = grunt.file.expand(
        { 
            filter: 'isDirectory'
        },
        dirs.src.modules
    );
  
    return {
      // options: {
      //   includePaths: Modules
      // },
      dev: {
        options: {
          sourceMap: true,
          //includePaths: (function(){
          //    return Modules.concat(['_src/StyleSheets/environments/dev']);
          //  })()
        
        },        
        files: [{
            expand: true,
            cwd: dirs.src.base,
            src: ["**/*.scss"],
            dest: dirs.dist.base,
            ext: ".css"
        }]
      },
      prod: {
        options: {
          sourceMap: false,
          outputStyle: 'compressed',
          //includePaths: (function(){
          //  return Modules.concat(['_src/StyleSheets/environments/prod']);
          //})()
        },
        files: [{
            expand: true,
            cwd: dirs.src.base,
            src: ["**/*.scss"],
            dest: dirs.dist.base,
            ext: ".css",
            rename: function (dst, src) {
                // To keep the source js files and make new files as `*.min.js`:
                // return dst + '/' + src.replace('.js', '.min.js');
                // Or to override to src:
                //return src;
                return dst + '/' + src.replace('.css', '.v' + pkg.version + '.min.css');
            }
        }]
      }
    }
  };