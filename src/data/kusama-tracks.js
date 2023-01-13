const KUSAMA_TRACK_INFO = [
  {
    id: 0,
    name: 'root',
    origin: { Origins: 'Root' },
    text: 'Root Track'
  },
  {
    id: 1,
    name: 'whitelisted_caller',
    origin: { Origins: 'WhitelistedCaller' },
    text: 'Origin able to dispatch a whitelisted call'
  },
  {
    id: 10,
    name: 'staking_admin',
    origin: { Origins: 'StakingAdmin' },
    text: 'Origin for cancelling slashes'
  },
  {
    id: 11,
    name: 'treasurer',
    origin: { Origins: 'Treasurer' },
    text: 'Origin for spending (any amount of) funds'
  },
  {
    id: 12,
    name: 'lease_admin',
    origin: { Origins: 'LeaseAdmin' },
    text: 'Origin able to force slot leases'
  },
  {
    id: 13,
    name: 'fellowship_admin',
    origin: { Origins: 'FellowshipAdmin' },
    text: 'Origin for managing the composition of the fellowship'
  },
  {
    id: 14,
    name: 'general_admin',
    origin: { Origins: 'GeneralAdmin' },
    text: 'Origin for managing the registrar'
  },
  {
    id: 15,
    name: 'auction_admin',
    origin: { Origins: 'AuctionAdmin' },
    text: 'Origin for starting auctions'
  },
  {
    id: 20,
    name: 'referendum_canceller',
    origin: { Origins: 'ReferendumCanceller' },
    text: 'Origin able to cancel referenda'
  },
  {
    id: 21,
    name: 'referendum_killer',
    origin: { Origins: 'ReferendumKiller' },
    text: 'Origin able to kill referenda'
  },
  {
    id: 30,
    name: 'small_tipper',
    origin: { Origins: 'SmallTipper' },
    text: 'Origin able to spend up to 1 KSM from the treasury at once'
  },
  {
    id: 31,
    name: 'big_tipper',
    origin: { Origins: 'BigTipper' },
    text: 'Origin able to spend up to 5 KSM from the treasury at once'
  },
  {
    id: 32,
    name: 'small_spender',
    origin: { Origins: 'SmallSpender' },
    text: 'Origin able to spend up to 50 KSM from the treasury at once'
  },
  {
    id: 33,
    name: 'medium_spender',
    origin: { Origins: 'MediumSpender' },
    text: 'Origin able to spend up to 500 KSM from the treasury at once'
  },
  {
    id: 34,
    name: 'big_spender',
    origin: { Origins: 'BigSpender' },
    text: 'Origin able to spend up to 5,000 KSM from the treasury at once'
  }
]

const getTrackInfo = ( trackId ) => {
  return KUSAMA_TRACK_INFO.find( t => parseInt(t.id) === parseInt(trackId) );
}

export {
  KUSAMA_TRACK_INFO,
  getTrackInfo
}