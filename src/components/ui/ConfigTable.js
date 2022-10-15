import { Tab } from "@headlessui/react"
import { pick } from "lodash"

export default function ConfigTable({json}) {

  const isObjOrArray = ( obj ) => {
    return typeof obj === 'object' ||
      Array.isArray(obj)
  }

  const isOptions = ( obj ) => {
    return obj
  }
  
  const getTable = () => (
      <table className="table-auto w-full">
          <tbody>
              {json && Object.keys(json).map((row, index) => {

                console.log( index, row )
                  if ( row === 'options' ) {
                    return <tr key={`row${index}`}>
                      <td>options</td>
                      { json[row].map( ( opt, idx ) => {
                        return <div key={ `opt-${idx}` } className="flex items-center align-middle py-2">
                            <b>{ opt.rarity }</b>
                            <pre className="text-xs pl-4">
                              { JSON.stringify( pick( opt, ['minProbability', 'maxProbability', 'sweetspotProbability'] ), null, 2 ) }
                            </pre>
                          </div>
                      })}
                    </tr>
                  }

                  return <tr key={`row${index}`}>
                    <td key={row}>{row}</td>
                    <td key={index}>
                        { isObjOrArray( json[row] ) && <pre className="text-xs">
                          { JSON.stringify(json[row], null, 2) }
                        </pre> }
                        { ! isObjOrArray( json[row] ) && JSON.stringify( json[row] ) }
                    </td>
                  </tr>
              })}
          </tbody>
      </table>
  )

  return getTable()

 }