import fs from 'fs-extra'
import { obj as map } from 'through2'
import vfs from 'vinyl-fs'

export default (files) => () =>
  vfs.src(files, { allowEmpty: true }).pipe(map((file, enc, next) => fs.remove(file.path, next)))


