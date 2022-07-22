export default function Input( props ) {
  const {
    placeholder,
    id,
    label,
    type,
    min = 0,
    step=0.01,
    options=[]
  } = props;
  return (
    <>
      <label
        htmlFor={ id }
        className="mt-4 form-label block text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
        { label }
      </label>
      { type === 'number' &&
        <input
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
          type={ type }
          placeholder={ placeholder }
        />
      }
      { type === 'select' &&
        <select
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
        >
          { options.map( ({ value, label }) =>
            <option key={ value } value={ value }>{ label }</option>
          )}
        </select>
      }
      { type !== 'select' && type !== 'number' &&
        <input
          className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg"
          type={ type }
          step={ step }
          min={ min }
          placeholder={ placeholder }
        />
      }
    </>
  )
}