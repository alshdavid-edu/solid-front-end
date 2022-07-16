const { readdirSync, readFileSync, existsSync, writeFileSync, statSync } = require('node:fs')
const { resolve, join, basename, dirname } = require('node:path')
const childProcess = require('node:child_process')
const yaml = require('./vendor/js-yaml')

const __dirroot = resolve(__dirname, '..')
const __dirdist = join(__dirname, 'dist')

const spawnSync = (command, options) => {
  console.log(command.join(' '))
  const [ exe, ...args ] = command
  const defaultOptions = {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirroot,
  }
  return childProcess.spawnSync(exe, args, { ...defaultOptions, ...options })
}

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

function compressFile(filePath) {
  const b = basename(filePath)
  const d = dirname(filePath)
  // spawnSync(['brotli', '--best', '--force', '-o', b, b], { cwd: d })
}

function compressFolder(targetDir) {
  for (const fileName of readdirSync(targetDir)) {
    const fullTargetPath = join(targetDir, fileName)
    if (statSync(fullTargetPath).isDirectory()) {
      compress(fullTargetPath)
      continue
    }

    compressFile(fullTargetPath)
  }
}