const childProcess = require('node:child_process')
const { resolve } = require('node:path')

const __dirroot = resolve(__dirname, '..', '..')

const spawnSync = (command, options = {}) => {
  if (options.echo !== false) {
    console.log(command.join(' '))
  }
  const [ exe, ...args ] = command
  const defaultOptions = {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirroot,
  }
  return childProcess.spawnSync(exe, args, { ...defaultOptions, ...options })
}

module.exports = {
  spawnSync,
}