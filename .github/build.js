const { readdirSync, readFileSync, existsSync, writeFileSync, statSync } = require('node:fs')
const { resolve, join, basename } = require('node:path')
const yaml = require('./vendor/js-yaml')
const { spawnSync } = require('./vendor/spawn')
const { compressFile, compressFolder } = require('./vendor/compress')

const __dirroot = resolve(__dirname, '..')
const __dirdist = join(__dirname, 'dist')

spawnSync(['rm', '-rf', __dirdist])
spawnSync(['mkdir', __dirdist])

const index = []

for (const dir of readdirSync(__dirroot)) {
  if (dir.startsWith('.')) {
    continue
  }
  if (statSync(join(__dirroot, dir)).isFile()) {
    continue
  }

  let config = join(__dirroot, dir, 'index.yaml')
  if (!existsSync(config)) {
    config = join(__dirroot, dir, 'index.yml')
  }
  if (!existsSync(config)) {
    console.error('Unable to find config for', dir)
    process.exit(1)
  }

  const doc = yaml.load(readFileSync(config, 'utf8'))
  const meta = {
    title: doc.title,
    folderName: dir,
    dateCreatedISO: new Date().toISOString(),
    dateLastEditedISO: new Date().toISOString(),
    folderURL: `/blog/${dir}`,
    indexURL: `/blog/${dir}/index.md`,
    metaURL: `/blog/${dir}/${basename(config)}`,
    tags: doc.tags || []
  }

  index.push(meta)
  spawnSync(['cp', '-r', dir, join(__dirdist, dir)])
  spawnSync(['rm', '-rf', join(__dirdist, dir, basename(config))])

  writeFileSync(
    join(__dirdist, dir, 'index.json'), 
    JSON.stringify(meta), 
    { encoding: 'utf8' },
  )

  compressFolder(join(__dirdist, dir))
}

writeFileSync(
  join(__dirdist, 'index.json'), 
  JSON.stringify({ contents: index }), 
  { encoding: 'utf8' },
)

compressFile(join(__dirdist, 'index.json'))
