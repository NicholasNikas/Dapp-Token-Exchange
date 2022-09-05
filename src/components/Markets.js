import { useSelector, useDispatch } from 'react-redux'
import { loadTokens } from '../store/interactions'
import config from '../config.json'

const Markets = () => {
  const provider = useSelector((state) => state.provider.connection)
  const chainId = useSelector((state) => state.provider.chainId)

  const dispatch = useDispatch()

  const marketHandler = async (event) => {
    await loadTokens(provider, event.target.value.split(','), dispatch)
  }

  return (
    <div className='component exchange__markets'>
      <div className='component__header'>
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name='markets' id='markets' onChange={marketHandler}>
          <option
            value={`${config[chainId].DApp.address},${config[chainId].mETH.address}`}
          >
            DApp / mETH
          </option>
          <option
            value={`${config[chainId].DApp.address},${config[chainId].mDAI.address}`}
          >
            DApp / mDAI
          </option>
        </select>
      ) : (
        <div>
          <p>Not Deployed to Network</p>
        </div>
      )}

      <hr />
    </div>
  )
}

export default Markets
