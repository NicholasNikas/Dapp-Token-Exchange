const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

module.exports = { tokens }
