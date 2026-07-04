import styles from './Spinner.module.css'

export function Spinner() {
  return (
    <span className={styles.container} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.visuallyHidden}>Loading</span>
    </span>
  )
}
