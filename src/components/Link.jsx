import { userRouter } from "../hooks/userRouter"

export function Link ({ href, children, ...restOfProps }) {
  const { navigateTo } = userRouter()

  const handleClick = (event) => {
    event.preventDefault()
    navigateTo(href)
  }

  return (
    <a href={href} {...restOfProps} onClick={handleClick}>
      {children}
    </a>
  )
}