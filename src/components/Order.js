import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeBuyOrder, makeSellOrder } from '../store/interactions'

const Order = () => {
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(0)

  const buyRef = useRef(null)
  const sellRef = useRef(null)

  const dispatch = useDispatch()

  const provider = useSelector((state) => state.provider.connection)
  const exchange = useSelector((state) => state.exchange.contract)
  const tokens = useSelector((state) => state.tokens.contracts)

  const tabHandler = (event) => {
    if (event.target.className !== buyRef.current.className) {
      event.target.className = 'tab tab--active'
      buyRef.current.className = 'tab'
      setIsBuy(false)
    } else {
      event.target.className = 'tab tab--active'
      sellRef.current.className = 'tab'
      setIsBuy(true)
    }
  }

  const buyHandler = (event) => {
    event.preventDefault()

    const order = { amount, price }
    makeBuyOrder(provider, exchange, tokens, order, dispatch)

    setAmount(0)
    setPrice(0)
  }

  const sellHandler = (event) => {
    event.preventDefault()

    const order = { amount, price }
    makeSellOrder(provider, exchange, tokens, order, dispatch)

    setAmount(0)
    setPrice(0)
  }

  return (
    <div className='component exchange__orders'>
      <div className='component__header flex-between'>
        <h2>New Order</h2>
        <div className='tabs'>
          <button
            className='tab tab--active'
            ref={buyRef}
            onClick={(e) => tabHandler(e)}
          >
            Buy
          </button>
          <button className='tab' ref={sellRef} onClick={(e) => tabHandler(e)}>
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        {isBuy ? (
          <label htmlFor='amount'>Buy Amount</label>
        ) : (
          <label htmlFor='amount'>Sell Amount</label>
        )}

        <input
          type='text'
          id='amount'
          placeholder='0.0000'
          value={amount === 0 ? '' : amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        {isBuy ? (
          <label htmlFor='price'>Buy Price</label>
        ) : (
          <label htmlFor='price'>Sell Price</label>
        )}

        <input
          type='text'
          id='price'
          placeholder='0.0000'
          value={price === 0 ? '' : price}
          onChange={(event) => setPrice(event.target.value)}
        />

        <button className='button button--filled' type='submit'>
          {isBuy ? <span>Buy Order</span> : <span>Sell Order</span>}
        </button>
      </form>
    </div>
  )
}

export default Order
