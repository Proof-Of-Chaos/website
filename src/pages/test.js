import Layout from '../layouts/layout'
import { countBy, some } from 'lodash';
import { useLatestUserVoteForRef, useLatestVoteForUserAndRef, useUserVotes } from '../hooks/use-votes';
import { useGov2Referendums, useGov2Tracks, useIssuance } from '../hooks/use-gov2';
import { titleCase } from '../utils';
import Loader from '../components/ui/loader';
import { useMemo, useState } from 'react';
import { data } from 'autoprefixer';
import { useEffect } from 'react';
import ReferendumDetail from '../components/ui/referendum/referendum-detail';
import { KUSAMA_TRACK_INFO } from '../data/kusama-tracks';
import Tippy from '@tippyjs/react';
import useAppStore from '../zustand';
import Button from '../components/ui/button';
import { getWalletBySource} from "@talismn/connect-wallets";
// import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
// import { BN_ZERO } from '@polkadot/util';


import { castVote } from '../data/vote-service'
import { useVoteManager } from '../hooks/use-vote-manager';
import { useIsMounted } from '../hooks/use-is-mounted';

function Test() {
  const isMounted = useIsMounted()
  const updateVoteState = useAppStore((state) => state.updateVoteState)
  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const wallet = getWalletBySource(connectedAccount?.source)

  const { voteOnRef, refsBeingVoted } = useVoteManager();

  const voteOnRef139 = async () => {
    console.log( 'will vote aye on ref 139 with conviction 0.1' )
    voteOnRef(139,true,3,'none')
  }

  return (
    <div>
      <Button variant="calm" onClick={ voteOnRef139 }>vote on ref 139</Button>
      { isMounted && JSON.stringify( refsBeingVoted, null, 2 )}
    </div>
  )
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
