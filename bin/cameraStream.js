var path       = require('path')
  , opencv     = require('opencv')
  , moduleRoot = path.resolve(path.join(__dirname, '..'));

require('babel/register')({
  stage      : 0,
  extensions : ['.es6']
});

var Camera = require(path.join(moduleRoot, 'utils', 'biometric', 'Camera.es6'));

module.exports = new Camera();
