import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import config from '../config.json'
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders,
} from '../store/interactions'
import Navbar from './Navbar.js'
import Markets from './Markets.js'
import Balance from './Balance.js'
import Order from './Order.js'
import OrderBook from './OrderBook.js'
import PriceChart from './PriceChart.js'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider, dispatch)
    })

    const { DApp, mETH, exchange: exchangeConfig } = config[chainId]
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    const exchange = await loadExchange(
      provider,
      exchangeConfig.address,
      dispatch
    )

    loadAllOrders(provider, exchange, dispatch)

    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>
      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          <Markets />

          <Balance />

          <Order />
        </section>
        <section className='exchange__section--right grid'>
          <PriceChart />

          {/* Transactions */}

          {/* Trades */}

          <OrderBook />
        </section>
      </main>

      {/* Alert */}
    </div>
  )
}

export default App
