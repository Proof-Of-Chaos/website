import { width } from "@mui/system";
import Tippy from "@tippyjs/react";

export default function ReferendumStats( { aye, nay, status, part, total, threshold } ) {
  

  const StatusBadge = () => {
    return <span className={ `status-${ status.toLowerCase() } w-full` }>{ status }</span>
  }

  if ( part && total ) {
    const widthSupport = `${ parseFloat( part / parseInt(total) * 100 ).toFixed(4) }%`;

    return (
      <div className="referendum-stats align-bottom">
        <Tippy content={ <>Support is currently <b>{ widthSupport }</b> of a needed <b>{ threshold.toFixed(4) }%</b> to reach the support threshold </> }>
          <div className="mb-3">
            <svg width="100%" height="8" className="rounded-md">
              <rect x="0" y="0" width="100%" height="12" fill="rgb(200,200,200)" />
              <rect
                x="0"
                y="0"
                height="12"
                fill="rgb(74,222,128)"
                width={ widthSupport }
              />
            </svg>
            <span className="text-sm">{ widthSupport } / { threshold }%</span>
          </div>
        </Tippy>
      </div>
    )
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
          <h5 className="font-medium uppercase sm:text-base">
            Aye ({aye?.percentage}%)
          </h5>
          <p>{aye?.voteVolume}</p>
        </div>
        <div className="text-red-500 ltr:text-right rtl:text-left">
          <h5 className="font-medium uppercase sm:text-base">
            Nay ({nay?.percentage}%)
          </h5>
          <p>{nay?.voteVolume}</p>
        </div>
      </div>
    </div>
  )
}