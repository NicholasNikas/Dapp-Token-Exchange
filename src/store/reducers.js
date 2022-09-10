export const provider = (state = {}, action) => {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection,
      }

    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId,
      }

    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account,
      }

    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance,
      }

    default:
      return state
  }
}

export const tokens = (
  state = { loaded: false, contracts: [], symbols: [] },
  action
) => {
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [action.token],
        symbols: [action.symbol],
      }
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol],
      }

    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      }

    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }

    default:
      return state
  }
}

export const exchange = (
  state = {
    loaded: false,
    contract: {},
    transaction: { isSuccessful: false },
    events: [],
    allOrders: { loaded: false, data: [] },
  },
  action
) => {
  let index, data

  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      }

    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      }

    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }

    case 'TRANSFER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true,
      }

    case 'TRANSFER_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.event, ...state.events],
      }

    case 'TRANSFER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
        transferInProgress: false,
      }

    case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false,
        },
      }

    case 'NEW_ORDER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
      }

    case 'NEW_ORDER_SUCCESS':
      index = state.allOrders.data.findIndex(
        (order) => order.id === action.orderId
      )

      if (index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data
      }

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data,
        },
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true,
        },
        events: [action.event, ...state.events],
      }

    default:
      return state
  }
}
