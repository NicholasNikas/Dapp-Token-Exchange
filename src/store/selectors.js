import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import { ethers } from 'ethers'
import moment from 'moment'

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = (state) => get(state, 'tokens.contracts')

const allOrders = (state) => get(state, 'exchange.allOrders.data', [])

const cancelledOrders = (state) =>
  get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', [])

const openOrders = (state) => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some(
      (filledOrder) => filledOrder.id.toString() === order.id.toString()
    )
    const orderCancelled = cancelled.some(
      (cancelledOrder) => cancelledOrder.id.toString() === order.id.toString()
    )
    return orderFilled || orderCancelled
  })

  return openOrders
}

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount

  // ex: Giving mETH in exchange for DApp
  if (order.tokenGive === tokens[1].address) {
    token0Amount = order.amountGive // amount of DApp we are giving
    token1Amount = order.amountGet // amount of mETH we want
  } else {
    token0Amount = order.amountGet // amount of DApp we want
    token1Amount = order.amountGive // amount of mETH we are giving
  }

  return {
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
    token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
    tokenPrice: Math.round((token1Amount / token0Amount) * 100000) / 100000,
    formattedTimestamp: moment
      .unix(order.timestamp)
      .format('h:mm:ssa dddd MMM D YYYY'),
  }
}

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return
    }

    orders = orders.filter(
      (order) =>
        order.tokenGet === tokens[0].address ||
        order.tokenGet === tokens[1].address
    )
    orders = orders.filter(
      (order) =>
        order.tokenGive === tokens[0].address ||
        order.tokenGive === tokens[1].address
    )

    orders = decorateOrderBookOrders(orders, tokens)
    orders = groupBy(orders, 'orderType')

    const buyOrders = get(orders, 'buy', [])
    orders = {
      ...orders,
      buyOrders: buyOrders.sort(
        (order1, order2) => order2.tokenPrice - order1.tokenPrice
      ),
    }

    const sellOrders = get(orders, 'sell', [])
    orders = {
      ...orders,
      sellOrders: sellOrders.sort(
        (order1, order2) => order2.tokenPrice - order1.tokenPrice
      ),
    }

    return orders
  }
)

const decorateOrderBookOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens)
    order = decorateOrderBookOrder(order, tokens)
    return order
  })
}

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === 'buy' ? GREEN : RED,
    orderFillAction: orderType === 'buy' ? 'sell' : 'buy',
  }
}

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return
    }

    orders = orders.filter(
      (order) =>
        order.tokenGet === tokens[0].address ||
        order.tokenGet === tokens[1].address
    )
    orders = orders.filter(
      (order) =>
        order.tokenGive === tokens[0].address ||
        order.tokenGive === tokens[1].address
    )

    orders = orders.sort(
      (order1, order2) => order1.timestamp - order2.timestamp
    )

    orders = orders.map((order) => decorateOrder(order, tokens))

    let lastOrder, secondLastOrder
    ;[secondLastOrder, lastOrder] = orders.slice(-2)

    const lastPrice = get(lastOrder, 'tokenPrice', 0)
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? '+' : '-',
      series: [
        {
          data: buildGraphData(orders),
        },
      ],
    }
  }
)

const buildGraphData = (orders) => {
  orders = groupBy(orders, (order) =>
    moment.unix(order.timestamp).startOf('hour').format()
  )

  const hours = Object.keys(orders)
  const graphData = hours.map((hour) => {
    const group = orders[hour]
    const open = group[0]
    const high = maxBy(group, 'tokenPrice')
    const low = minBy(group, 'tokenPrice')
    const close = group[group.length - 1]

    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    }
  })

  return graphData
}