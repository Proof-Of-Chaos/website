import { encodeAddress } from '@polkadot/keyring'
import { isNumber } from 'lodash';
import Image from "next/image";
import Link from 'next/link';
import { useDragonLeaderboard, useLastLeaderboardUpdate, useLeaderboard, useShelfThumbnail } from "../../hooks/use-leaderboard";
import { trimAddress } from "../../utils";
import useAppStore from '../../zustand';
import Button from '../ui/button';
import Loader, { InlineLoader } from "../ui/loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles/leaderboard.module.scss"

const SINGULAR_SHELF_BASE_URL = 'https://singular.app/collectibles/kusama/3208723ec6f65df810-SHELF/'
const SINGULAR_WALLET_BASE_URL = 'https://singular.app/space/kusama/'

function LeaderRow( props ) {
  const { place, id, score, wallet, thumbnail = '', className=styles.listItem } = props
  const ksmAddress = encodeAddress( wallet, 2 );

  const imageDimension = place < 3 ? 300 : 200

  return(
    <li className={ className }>
      <div className={ styles.rank }>{ place + 1 }</div>
      <div className={ styles.thumb }>
        { thumbnail && thumbnail !== '' && <Image
          src={ thumbnail }
          alt={ `Shelf for wallet ${ wallet }` }
          width={imageDimension}
          height={imageDimension}
        /> }
        { thumbnail && thumbnail === '' &&
          <a className={ styles.link } href={ `${ SINGULAR_SHELF_BASE_URL}${id}` }>view shelf<br /> on singular</a>
        }
      </div>
      <div className={ styles.score }>
        <span>score</span>
        { Number(score).toFixed(2) }
      </div>
      <div className={ styles.wallet }>
        <span>owner</span>
        <a href={ `${ SINGULAR_WALLET_BASE_URL }${ ksmAddress }`}>{ trimAddress( ksmAddress, 4 ) }</a>
      </div>
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
  const { data: leaderboard, isLoading, error } = useLeaderboard();

  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const connectedAccount = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex] )
  const userAddress = connectedAccount?.ksmAddress

  const userRank = leaderboard?.scores?.findIndex( el => el.wallet === userAddress )
  const { data, isLoading: isLastBlockLoading } = useLastLeaderboardUpdate()

  if ( error ) {
    return (
      <div className="leaderboard error text-center text-red-700 py-7">
        There was an error getting the shelf leaderboard. Please try again later.
      </div>
    )
  }

  return (
    <div className="leaderboard">

      { isLoading && <Loader /> }
      { ! isLoading && <>
        { isFinite(userRank) && userRank !== -1 &&
          <div className={ styles.userRank }>
            <div>Your current shelf rank is <span>{ userRank }</span>/{leaderboard?.scores.length}</div>
            <div>to receive more NFTs <Link href="/vote"><Button variant="primary" className="ml-4">Vote on Referendums</Button></Link></div>
          </div>
        }
        { data && <>
            <div className="leaderboard-update text-right text-sm italic">
              Last Update:
              <FontAwesomeIcon icon={ faClock } className="pr-1" />{ data.lastUpdate.toUTCString() }
              <FontAwesomeIcon icon={ faCube } className="pr-1" />{ data.leaderboardBlock }
            </div>
          </>
        }
          <ol className={ styles.list }>
            { leaderboard?.scores.slice(0,50).map( (row, place) => {
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

export function DragonLeaderboard( props ) {
  const { data: leaderboard, isLoading, error } = useDragonLeaderboard();

  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const connectedAccount = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex] )
  const userAddress = connectedAccount?.ksmAddress

  const userRank = leaderboard?.scores?.findIndex( el => el.wallet === userAddress )

  const { data: lastUpdate, isLoading: isLastBlockLoading } =
    useLastLeaderboardUpdate()

  if ( error ) {
    return (
      <div className="leaderboard error text-center text-red-700 py-7">
        There was an error getting the dragon leaderboard. Please try again later.
      </div>
    )
  }

  return (
    <div className="dragon-leaderboard">
      <div className={styles.intro}>
        <p>
          Temporary adult dragon leaderboard. All shelves with adolescent dragons equipped are eligible.
        </p>
        <p>
          <b>Only top 25 shelves</b> with the highest scores at snapshot time will have their dragons evolve to the adult stage.
        </p>
      </div>
      { isLoading && <Loader /> }
      { ! isLoading && <>
        { isFinite(userRank) && userRank !== -1 &&
          <div className={ styles.dragonRank }>
            <div>Your current adult dragon rank is <span>{ userRank }</span>/{leaderboard?.scores.length}</div>
          </div>
        }
        { lastUpdate && <>
          <div className="leaderboard-update text-right text-sm italic">
            <FontAwesomeIcon icon={ faClock } className="pr-1" />
            Last Update: { lastUpdate.toUTCString() }
          </div>
          </>
        }
          <ol className={ styles.list }>
            { leaderboard?.scores.map( (row, place) => {
              let theClass = `${ styles.listItem }`
              if ( place < 25 ) {
                theClass = `${styles.listItem} ${styles.dragonListItem}`
              }
              return <LeaderRow
                key={ place }
                thumbnail={ false }
                place={ place }
                className={ theClass }
                {...row}
              />
            } ) }
          </ol>
        </>
      }
    </div>
  )
}