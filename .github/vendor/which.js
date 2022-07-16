const { spawnSync } = require('./spawn')

function which(command) {
  const details = spawnSync(['which', command], { echo: false })
  return details.status === 0
}

module.exports = {
  which
}