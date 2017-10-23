/*****************************************
 *  SASS Preprocessing
 ****************************************/
module.exports = function (grunt, options) {
    var dirs = options.dirs;
  
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
        files: [
          {
            dest: dirs.tmp.base + '/nci-global.css',
            src: dirs.src.base + '/nci-global.scss'
          },
          {
            dest: dirs.tmp.modules + 'returnToNCI/returnToNCI-bar.css',
            src: dirs.src.modules + 'returnToNCI/returnToNCI-bar.scss'
          }          
        ]
      }
    }
  };