import { width } from "@mui/system";
import Tippy from "@tippyjs/react";

export default function ReferendumStats( { aye, nay, status, part, total, threshold } ) {
  const StatusBadge = () => {
    return <span className={ `status-${ status.toLowerCase() } w-full` }>{ status }</span>
  }

  if ( part && total ) {
    const widthSupport = parseFloat( part / parseInt(total) * 100 );
    
    //show 20% more than threshold
    const maxSupportShown = threshold * 100 * 1.2; 

    //translate all widths
    const widthFactor = maxSupportShown !== 0 ? 1 / maxSupportShown * 100 : 1.0;
    // console.log( 'widthfactor', widthFactor, widthSupport, maxSupportShown, threshold )

    return (
      <div className="referendum-stats align-bottom mb-3 relative">
        <Tippy content={ <>Support is currently <b>{ widthSupport.toFixed(4) }%</b> of a needed <b>{ (threshold * 100).toFixed(4) }%</b> to reach the support threshold. <br/>The threshold will decrease over time. </> }>
          <svg width="100%" height="10" className="rounded-md">
            <rect x="0" y="0" width="100%" height="12" fill="rgb(200,200,200)" />
            <rect
              x="0"
              y="0"
              height="12"
              fill="rgb(74,222,128)"
              width={ `${widthSupport * widthFactor}%` }
            />
          </svg>
        </Tippy>
          <svg 
            width="3" 
            height="18" 
            className="rounded-md absolute -top-[4px]"
            style={ { left: `${threshold * 100 * widthFactor}%` } }
          >
            <Tippy content={ <><b>{ (threshold * 100.0).toFixed(4) }%</b></> }>
                <rect
                  x="0"
                  y="0"
                  height="18"
                  fill="#444"
                  width="3"
                />
              </Tippy>
          </svg>
          <span className="text-sm">{ widthSupport.toFixed(2) }% / { (threshold * 100.0).toFixed(2) }%</span>
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
      <div className="mb-2 relative">
        <svg width="100%" height="10" className="rounded-md">
          <rect x="0" y="0" width="100%" height="12" fill="rgb(248,113,113)" />
          <rect
            x="0"
            y="0"
            height="12"
            fill="rgb(74,222,128)"
            width={`${aye.percentage}%`}
          />
        </svg>
        { threshold && <svg
          width="3"
          height="18"
          className="rounded-md absolute -top-[4px]"
          style={ { left: `${threshold * 100}%` } }
        >
          <Tippy content={ <><b>{ (threshold * 100.0).toFixed(4) }%</b></> }>
              <rect
                x="0"
                y="0"
                height="18"
                fill="#444"
                width="3"
              />
            </Tippy>
        </svg> }
      </div>
      <div className="flex items-start justify-between">
        <div className="text-green-500 ltr:text-left rtl:text-right">
          <h5 className="uppercase text-sm">
            Aye ({aye?.percentage}%)
          </h5>
          <p className="text-sm">{aye?.voteVolume}</p>
        </div>
        <div className="text-red-500 ltr:text-right rtl:text-left">
          <h5 className="uppercase text-sm">
            Nay ({nay?.percentage}%)
          </h5>
          <p className="text-sm">{nay?.voteVolume}</p>
        </div>
      </div>
    </div>
  )
}