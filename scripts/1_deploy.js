const { ethers } = require('hardhat')

async function main() {
  console.log(`Preparing for deployment...\n`)
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  const accounts = await ethers.getSigners()

  console.log(
    `Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`
  )

  // Deploy contract
  const dapp = await Token.deploy('DAPP', 'DAPP', '1000000')
  await dapp.deployed()
  console.log(`DAPP Deployed to: ${dapp.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', '1000000')
  await mETH.deployed()
  console.log(`mETH Deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
  await mDAI.deployed()
  console.log(`mDAI Deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
