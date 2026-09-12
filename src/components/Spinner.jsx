import styles from './Spinner.module.css'

export default function Spinner ({ label = 'Cargando...' }) {
  return (
    <div className={styles.spinnerWrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </div>
  )
}
