const config = require('../src/config.json')
const { tokens } = require('../src/TokensConverter.js')

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function main() {
  // Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners()

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()
  console.log('Using chainID: ', chainId)

  // Fetch deployed tokens
  const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)
  console.log(`DApp Token fetched: ${DApp.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
  console.log(`mETH Token fetched: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI Token fetched: ${mDAI.address}\n`)

  // Fetch the deployed exchange
  const exchange = await ethers.getContractAt(
    'Exchange',
    config[chainId].exchange.address
  )
  console.log(`Exchange Token fetched: ${exchange.address}\n`)

  // Give tokens to receiver
  const sender = accounts[0] // deployer
  const receiver = accounts[1]
  let amount = tokens(10000)

  // user1 transfers 10,000 mETH...
  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(
    `Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`
  )

  // Set up exchange users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  // user1 approves 10,000 DApp...
  transaction = await DApp.connect(user1).approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  // user1 deposits 10,000 DApp...
  transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  // user2 approves 10,000 mETH...
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}\n`)

  // user2 deposits 10,000 mETH...
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}\n`)

  // Seed a cancelled order
  let orderId
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // user1 cancels order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // wait 1 second
  await wait(1)

  // Seed filled orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // user2 fills order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // wait 1 second
  await wait(1)

  // user1 makes another order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // user2 fills another order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // wait 1 second
  await wait(1)

  // user1 makes final order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // user2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // wait 1 second
  await wait(1)

  ///////////////////
  // Seed open orders

  // user1 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)
    await wait(1)
  }

  // user2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}\n`)
    await wait(1)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
