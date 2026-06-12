'use strict'

const vfs = require('vinyl-fs')
const zip = require('gulp-zip')

module.exports = (src, dest, bundleName) => () =>
  vfs
    .src('**/*', { base: src, cwd: src })
    .pipe(zip(`${bundleName}-bundle.zip`))
    .pipe(vfs.dest(dest))
