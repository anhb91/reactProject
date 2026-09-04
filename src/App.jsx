import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'

import { HomePage } from './pages/Home.jsx'
import { SearchPage } from './pages/Search.jsx'
import { NotFoundPage } from './pages/404.jsx'
import { Route } from './components/Route.jsx'
import { useRouter } from './hooks/useRouter.jsx'

const ROUTES = ['/', '/search']

function App() {
  const { currentPath } = useRouter()
  const isKnownRoute = ROUTES.includes(currentPath)

  return (
    <>
      <Header />
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      {!isKnownRoute && <NotFoundPage />}
      <Footer />
    </>
  )
}

export default App