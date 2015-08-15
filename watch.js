var watch = require('node-watch');
var execSync  = require('child_process').execSync
 
var files = ['build.js', 'config', 'layouts', 'lib', 'partials', 'src'];
watch(files, function(filename) {
  console.log('File changed: ' + filename);
  execSync('npm run build');
  console.log('Build complete');
});
