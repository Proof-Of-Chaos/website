import { useIsMounted } from "../../../hooks/use-is-mounted";
import { useUserNfts } from "../../../hooks/use-nfts";
import Loader from "../loader";
import ReferendumDetail from "./referendum-detail";

export function ReferendumList( { referendums, isLoading, error, isUserVotesLoading, userVotes } ) {
  const { data: userNfts } = useUserNfts()

  const isMounted = useIsMounted();

  if ( isMounted && isLoading ) {
    return <Loader text="loading referendums"/>
  }

  return (
    isMounted && <>
      { ! isLoading && referendums?.length > 0 ?
        referendums?.map( (referendum, idx) => (
          <div
            key={`${referendum.title}-key-${referendum.index}`}
            className="shadow-xl"
          >
            <ReferendumDetail
              referendum={ referendum }
              listIndex={ idx }
              userVote={ userVotes ? userVotes.find( vote => vote.referendumIndex === referendum.index ) : null }
              isUserVotesLoading={ isUserVotesLoading }
              userNFT={ userNfts && userNfts.find( nft => nft.symbol.startsWith( `${referendum.index}` ) ) }
            />
          </div>
        )) :
        <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
          There are currently no referendums to vote
        </h2>
      }
    </>
  )
}