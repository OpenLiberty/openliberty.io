import autoprefixer from 'autoprefixer'
import browserify from 'browserify'
import buffer from 'vinyl-buffer'
import concat from 'gulp-concat'
import cssnano from 'cssnano'
import fs from 'fs-extra'
import { obj as map } from 'through2'
import merge from 'merge-stream'
import ospath from 'path'
const path = ospath.posix
import postcss from 'gulp-postcss'
import postcssCalc from 'postcss-calc'
import postcssImport from 'postcss-import'
import postcssUrl from 'postcss-url'
import postcssVar from 'postcss-custom-properties'
import uglify from 'gulp-uglify'
import vfs from 'vinyl-fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

let imageminModule
async function loadImagemin() {
  if (!imageminModule) {
    imageminModule = await import('gulp-imagemin')
  }
  return imageminModule
}

export default (src, dest, preview) => async () => {
  const opts = { base: src, cwd: src }
  const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
  const postcssPlugins = [
    postcssImport,
    postcssUrl([
      {
        filter: '**/~typeface-*/files/*',
        url: (asset) => {
          const relpath = asset.pathname.substr(1)
          const abspath = require.resolve(relpath)
          const basename = ospath.basename(abspath)
          const destpath = ospath.join(dest, 'font', basename)
          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
          return path.join('..', 'font', basename)
        },
      },
    ]),
    postcssVar({ preserve: preview ? 'preserve-computed' : false }),
    preview ? postcssCalc : () => {},
    autoprefixer,
    preview ? () => {} : cssnano({ preset: 'default' }),
  ]

  const { default: imagemin, gifsicle, mozjpeg, optipng, svgo } = await loadImagemin()

  return merge(
    vfs
      .src('js/+([0-9])-*.js', { ...opts, sourcemaps })
      .pipe(uglify()),
    vfs
      .src('js/vendor/*.js', { ...opts, read: false })
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, enc, next) => {
          if (file.relative.endsWith('.bundle.js')) {
            file.contents = browserify(file.relative, { basedir: src, detectGlobals: false })
              .plugin('browser-pack-flat/plugin')
              .bundle()
            file.path = file.path.slice(0, file.path.length - 10) + '.js'
            next(null, file)
          } else {
            fs.readFile(file.path, 'UTF-8').then((contents) => {
              file.contents = Buffer.from(contents)
              next(null, file)
            })
          }
        })
      )
      .pipe(buffer())
      .pipe(uglify()),
    vfs.src('css/site.css', { ...opts, sourcemaps }).pipe(postcss(postcssPlugins)),
    vfs.src('font/*.{ttf,woff*(2)}', opts),
    vfs
      .src('img/**/*.{jpg,ico,png,svg}', opts)
      .pipe(
        imagemin([
          // Do not have gif files
          // Comment out to mitigate
          // https://github.com/OpenLiberty/openliberty.io/security/dependabot/37
          // gifsicle(),
          mozjpeg(),
          optipng(),
          svgo({
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          }),
        ])
      ),
    vfs.src('helpers/*.js', opts),
    vfs.src('layouts/*.hbs', opts),
    vfs.src('partials/*.hbs', opts)
  ).pipe(vfs.dest(dest, { sourcemaps: sourcemaps && '.' }))
}

