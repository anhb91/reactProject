import { userRouter } from "../hooks/userRouter";

export function Route ({ path, component: Component }) {
  const { currentPath } = userRouter()
  if (currentPath !== path) return null

  return <Component />
}