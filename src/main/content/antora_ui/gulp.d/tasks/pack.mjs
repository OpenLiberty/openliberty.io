import vfs from 'vinyl-fs'
import zip from 'gulp-vinyl-zip'

export default (src, dest, bundleName) => () =>
  vfs
    .src('**/*', { base: src, cwd: src })
    .pipe(zip.zip(`${bundleName}-bundle.zip`))
    .pipe(vfs.dest(dest))


