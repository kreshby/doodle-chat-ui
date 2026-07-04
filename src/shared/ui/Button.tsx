import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}
