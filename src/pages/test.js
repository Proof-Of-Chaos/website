import Layout from '../layouts/layout'
import { useLatestUserVoteForRef, useLatestVoteForUserAndRef } from '../hooks/use-votes';

/**
 * (0)
 * Add kilt to window in script tag to next js
 * https://nextjs.org/docs/basic-features/script
 */

/**
 * (I)
 * Register a dApp full chain DID via either sporran wallet or check the
 * workshop
 */

/**
 * (I.I)
 * create a well known did config: https://docs.kilt.io/docs/develop/dApp/well-known-did-config
 * 
 * 
 */

/**
 * (II)
 * setup communication between dapp and sporran extension
 * https://docs.kilt.io/docs/develop/dApp/session
 * 
 * const api = Kilt.ConfigService.get('api')
 * const did = '<did from above>'
 * const dAppName = 'Your dApp Name'
 */

/**
 * (III)
 * Frontend claim flow: https://docs.kilt.io/docs/develop/workshop/claimer/request
 *
 * 1. we need to create a claim from the frontend
 * a) have the ctype, content, and lightDID from the claimer ready
 * b) can we get lightDID from sporran?
 * c) claim = Kilt.Claim.fromCTypeAndClaimContents(ctype, content, lightDid)
 * d) content can e.g. look like this:
 * {
 *  age: 28,
 *  name: 'Max Mustermann'
 * }
 *
 * 2. then we need to create a credential from that claim
 * a) credential = Kilt.Credential.fromClaim(claim)
 */


function Test() {
  const { data: userVote } = useLatestUserVoteForRef( 246 )
  return <div>test { JSON.stringify( userVote ) }</div>
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
