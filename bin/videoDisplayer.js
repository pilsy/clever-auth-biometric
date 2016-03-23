var path       = require('path')
  , projectDir = path.resolve(path.join(__dirname, '..'));

require('babel/register')({
  stage      : 0,
  extensions : ['.es6']
});

module.exports = require(path.join(projectDir, 'tests', 'assets', 'ffi-websocket.es6'));
