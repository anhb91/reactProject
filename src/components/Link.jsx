import { useRouter } from "../hooks/useRouter"
import styles from './Link.module.css'

export function Link ({ href, children, ...restOfProps }) {
  const { navigateTo, currentPath } = useRouter()

  const handleClick = (event) => {
    event.preventDefault()
    navigateTo(href)
  }

  return (
    <a className = {currentPath === href ? styles.link : ""} href={href} {...restOfProps} onClick={handleClick}>
      {children}
    </a>
  )
}