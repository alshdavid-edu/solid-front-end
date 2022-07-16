const { readdirSync, statSync } = require('node:fs')
const { spawnSync } = require('./spawn')
const { join, basename, dirname } = require('node:path')

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

module.exports = {
  compressFile,
  compressFolder,
}