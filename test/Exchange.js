const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let exchange, accounts, deployer, feeAccount, token1
  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')

    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]

    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100))
    await transaction.wait()
    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe('Deployment', () => {
    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount)
        result = await transaction.wait()

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(amount)
      })

      it('emits a Deposit event', async () => {
        const event = result.events[1]
        expect(event.event).to.equal('Deposit')
        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })
    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.reverted
      })
    })
  })

  describe('Withdrawing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount)
        result = await transaction.wait()

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount)
        result = await transaction.wait()

        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('withdraws token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(0)
      })

      it('emits a Withdraw event', async () => {
        const event = result.events[1]
        expect(event.event).to.equal('Withdraw')
        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(0)
      })
    })

    describe('Failure', () => {
      it('fails for insufficient balances', async () => {
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ).to.be.reverted
      })
    })
  })

  describe('Checking Balances', () => {
    let transaction, result
    let amount = tokens(1)

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount)
      result = await transaction.wait()

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    it('returns user balance', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      )
    })
  })
})
