import classNames from "classnames";

export default function Input( props ) {
  const {
    placeholder,
    id,
    label,
    type,
    min = 0,
    step=0.01,
    options=[],
    tooltip='',
    className,
    name,
  } = props;

  const classes = classNames(
    'form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg',
    className,
  )

  return (
    <>
      { label && '' !== label && <label
        htmlFor={ id }
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white">
        { tooltip !== '' ?
          <div className='has-tooltip relative'>
            <span className='tooltip rounded p-1 bg-gray-100/90 absolute'>
              {tooltip}
            </span>
            { label }
          </div>
        :
        <>
          { label }
        </>
        }
      </label> }
      { type === 'number' &&
        <input
          { ...props }
          className={ classes }
          type={ type }
          placeholder={ placeholder }
          id={ id }
        />
      }
      { type === 'select' &&
        <select
          { ...props }
          className={ classes }
          id={ id }
        >
          { options.map( ({ value, label }) =>
            <option key={ `${value}-${id}` } value={ value }>{ label }</option>
          )}
        </select>
      }
      {
        type === 'radio' && <>
        { options.map( ({ value, label }) =>
          <div
            key={ `${value}-${id}` }
            className="px-0 py-1"
          >
            <input
              { ...props }
              className="w-4 h-4 cursor-pointer text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="radio"
              id={ `${id}-${value}` }
              name={ name ? name : id }
              value={ value }
            />
            <label
              htmlFor={ `${id}-${value}` }
              className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              { label }
            </label>
          </div>
        )}
        </>
      }
      {
        type === 'checkbox' && <>
        { options.map( ({ value, label }) =>
          <div
            key={ `${value}-${id}` }
            className="px-0 py-1"
          >
            <input
              { ...props }
              className="w-4 h-4 cursor-pointer text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              id={ `${id}-${value}` }
              name={ name ? name : id }
              value={ value }
            />
            <label
              htmlFor={ `${id}-${value}` }
              className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              { label }
            </label>
          </div>
        )}
        </>
      }
      { type !== 'select' && type !== 'number' && type !== 'radio' && type !== 'checkbox' &&
        <input
          { ...props }
          id={ id }
          className=""
          type={ type }
          step={ step }
          min={ min }
          placeholder={ placeholder }
        />
      }
    </>
  )
}