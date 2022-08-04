import Image from 'next/image'
import { getRandomIntBetween } from '../../lib/utils'
import cn from 'classnames';
import { useNfts } from '../../lib/hooks/use-nfts';
import { sampleSize } from 'lodash';

export default function NFTSnippets( props ) {
  const { nfts } = useNfts();
  const positions = [
    [10,10],
    [12,80],
    [28,75],
    [70,80],
    [77,0],
    [84,60],
  ]
  const animNames = ['One','Two','Three'];

  return(
    <div
      className="nft-snippets absolute top-0 left-0 right-0 bottom-0"
    >
      {nfts && sampleSize(Object.values(nfts), 6)?.map( (nft, idx) => {
        const l = `${ positions[idx%6][0] }%`
        const t = `${ positions[idx%6][1] }%`

        if ( idx === 3 ) return

        return(
          <div
            key={ idx }
            className={ cn(
              'nft-snippet-item absolute shadow-lg',
              {
                'animate-floatingOne': idx % 3 === 0,
                'animate-floatingTwo': idx % 3 === 1,
                'animate-floatingThree': idx % 3 === 2,
              }
            ) }
            style={ {
              left: l,
              top: t,
              width: 120,
              height: 120,
            } }
          >
            <Image
              src={`https://gateway.ipfs.io/ipfs/${ nft.thumb }`}
              alt={`Referendum ${ nft.referendum }`}
              width={ 120 }
              height={ 120 }
            />
            <div
              className="nft-snippet-overlay absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed transition duration-300 ease-in-out"
            />
          </div>
        )
      })}
    </div>
  )
}