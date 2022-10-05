import { encodeAddress } from '@polkadot/keyring'
import Image from "next/image";
import { leaderboardShelfThumbnailFetcher, useLeaderboard, useShelfThumbnail } from "../../hooks/use-leaderboard";
import { trimAddress } from "../../utils";
import useAppStore from '../../zustand';
import Loader, { InlineLoader } from "../ui/loader";

import styles from "./styles/leaderboard.module.scss"

const SINGULAR_SHELF_BASE_URL = 'https://singular.app/collectibles/kusama/3208723ec6f65df810-SHELF/'
const SINGULAR_WALLET_BASE_URL = 'https://singular.app/space/kusama/'

function LeaderRow( props ) {
  const { place, id, score, wallet, thumbnail = '' } = props
  const ksmAddress = encodeAddress( wallet, 2 );

  const imageDimension = place < 3 ? 300 : 200

  return(
    <li className={ styles.listItem }>
      <div className={ styles.rank }>{ place + 1}</div>
      { place < 10 && <div className={ styles.thumb }>
        { thumbnail === '' && <InlineLoader /> }
        { thumbnail !== '' && <Image
          src={ thumbnail }
          alt={ `Shelf for wallet ${ wallet }` }
          width={imageDimension}
          height={imageDimension}
          className="{ styles.thumb }"
        />
        }
        </div>
      }
      <div className={ styles.wallet }>
        <span>owner</span>
        <a href={ `${ SINGULAR_WALLET_BASE_URL }${ ksmAddress }`}>{ trimAddress( ksmAddress, 4 ) }</a>
      </div>
      <div className={ styles.score }>
        <span>score</span>
        { Number(score).toFixed(2) }
      </div>
      <a className={ styles.link } href={ `${ SINGULAR_SHELF_BASE_URL}${id}` }>view shelf</a>
    </li>
  )
}

function LeaderRowWithThumbnail( props ) {
  const { data: updatedAt, isLoading } = useShelfThumbnail( props.id )
  return (
    <>
      { isLoading && <InlineLoader /> }
      { ! isLoading && <LeaderRow thumbnail={ updatedAt } { ...props } /> }
    </>
  )
}

export default function Leaderboard( props ) {
  const { data: leaderboard, isLoading } = useLeaderboard();

  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const connectedAccount = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex] )
  const userAddress = connectedAccount?.ksmAddress
  
  const isInTop50 = leaderboard?.scores?.findIndex( el => el.wallet === userAddress )
  console.log( 'isintop50', isInTop50 );

  return (
    <div className="leaderboard">
      { isLoading && <Loader /> }
      { ! isLoading && <>
        { isFinite(isInTop50) && 
          <div className={ styles.userRank }>Your current rank is <span>{ isInTop50 }</span></div>
        }
          <ol className={ styles.list }>
            { leaderboard.scores.slice(0,50).map( (row, place) => {
              if (place < 10 ) {
                return <LeaderRowWithThumbnail key={ place } place={ place } {...row} />
              } else {
                return <LeaderRow key={ place } place={ place } {...row} />
              }
            } ) }
          </ol>
        </>
      }
    </div>
  )
}