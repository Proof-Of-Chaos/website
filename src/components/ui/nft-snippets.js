import Image from 'next/image'
import { nfts } from '../../data/nft-snippets'
import { getRandomIntBetween } from '../../lib/utils'
import cn from 'classnames';

export default function NFTSnippets( props ) {
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
      {nfts.map( (nft, idx) => {
        const l = `${ positions[idx][0] }%`
        const t = `${ positions[idx][1] }%`

        return(
          <div
            key={ nft.thumb }
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
              className="absolute hover:bg-transparent top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed transition duration-300 ease-in-out"
              style={ { backgroundColor: 'rgba(255, 255, 255, 0.6)' } }
            />
          </div>
        )
      })}
    </div>
  )
}