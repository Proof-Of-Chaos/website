import { forwardRef } from 'react'
import cn from 'classnames'

const classes = {
  base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden text-center text-xs font-medium tracking-wider outline-none transition-all sm:text-sm',
  hover: 'hover:shadow-md hover:-translate-y-0.5 focus:-translate-y-0.5 focus:shadow-large focus:outline-none',
  disabled: 'opacity-50 cursor-not-allowed',
  shapes: {
    pill: 'rounded-full',
    rounded: ['rounded-md sm:rounded-lg'],
  },
  size: {
    large: 'px-7 sm:px-9 h-11 sm:h-13',
    medium: 'px-5 sm:px-8 h-10 sm:h-12',
    small: 'px-7 h-10',
    mini: 'px-4 h-8',
  },
  variant: {
      calm: 'text-gray-800 dark:text-white bg-transparent border-2 border-gray-800 dark:border-white',
      primary: ['text-white', 'bg-brand-600', 'hover:bg-brand-700', 'hover:ring-brand-800'],
      secondary: 'bg-gray-200 hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-gray-900 hover:text-white',
      warning: 'bg-amber-400 text-gray-800',
      danger: 'bg-red-500 hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-white'
  }
}

const Button = forwardRef(
  (
    {
      children,
      type = 'button',
      className,
      variant = 'primary',
      size = 'medium',
      shape = 'pill',
      disabled = false,
      ...props
    }, ref
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      type={type}
      className={ cn(
        classes.base,
        classes.hover,
        classes.variant[ variant ],
        classes.size[ size ],
        classes.shapes[ shape ],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
);


Button.displayName = 'Button'
export default Button