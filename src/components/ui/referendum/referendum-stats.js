export default function ReferendumStats( { aye, nay, status } ) {
  const StatusBadge = () => {
    return <span className={ `status-${ status.toLowerCase() } w-full` }>{ status }</span>
  }

  return (
    <div className="referendum-stats align-bottom">
      { status &&
        <div className="past-ref-status mb-4">
          <StatusBadge />
        </div>
        }
      <div className="mb-3">
        <svg width="100%" height="8" className="rounded-md">
          <rect x="0" y="0" width="100%" height="12" fill="rgb(248,113,113)" />
          <rect
            x="0"
            y="0"
            height="12"
            fill="rgb(74,222,128)"
            width={`${aye?.percentage}%`}
          />
        </svg>
      </div>
      <div className="flex items-start justify-between">
        <div className="text-green-500 ltr:text-left rtl:text-right">
          <h5 className="mb-1 font-medium uppercase sm:mb-2 sm:text-base">
            Aye ({aye?.percentage}%)
          </h5>
          <p>
            {aye?.vote}
          </p>
          <p>{aye?.voteVolume}</p>
        </div>
        <div className="text-red-500 ltr:text-right rtl:text-left">
          <h5 className="mb-1 font-medium uppercase sm:mb-2 sm:text-base">
            Nay ({nay?.percentage}%)
          </h5>
          <p>
            {nay?.vote}
          </p>
          <p>{nay?.voteVolume}</p>
        </div>
      </div>
    </div>
  )
}