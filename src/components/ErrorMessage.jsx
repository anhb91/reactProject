import styles from './ErrorMessage.module.css'

export function ErrorMessage ({ title = 'Algo salió mal', description, onRetry }) {
  return (
    <div className={styles.errorMessage} role="alert">
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
