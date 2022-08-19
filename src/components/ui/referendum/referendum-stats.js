export default function ReferendumStats( { aye, nay } ) {
  return (
    <div className="referendum-stats pt-4 align-bottom">
      <div className="mb-3">
        <svg width="100%" height="8">
          <rect x="0" y="0" width="100%" height="12" fill="#FA606A" />
          <rect
            x="0"
            y="0"
            height="12"
            fill="#28D294"
            width={`${aye?.percentage}%`}
          />
        </svg>
      </div>
      <div className="flex items-start justify-between">
        <div className="text-green-500 ltr:text-left rtl:text-right">
          <h5 className="mb-1 font-medium uppercase sm:mb-2 sm:text-base">
            Aye
          </h5>
          <p>
            {aye?.vote} ({aye?.percentage}%)
          </p>
          <p>{aye?.voteVolume}</p>
        </div>
        <div className="text-red-500 ltr:text-right rtl:text-left">
          <h5 className="mb-1 font-medium uppercase sm:mb-2 sm:text-base">
            Nay
          </h5>
          <p>
            {nay?.vote} ({nay?.percentage}%)
          </p>
          <p>{nay?.voteVolume}</p>
        </div>
      </div>
    </div>
  )
}