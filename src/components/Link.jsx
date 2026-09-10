import { Link as NavLink } from "react-router";
import styles from './Link.module.css'

export function Link ({ href, className, children, ...restOfProps }) {
  return (
    <NavLink
      to={href}
      className={[href ? styles.link : "", className].filter(Boolean).join(" ")}
      {...restOfProps}
    >
      {children}
    </NavLink>
  )
}
