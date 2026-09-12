import { Routes, Route } from "react-router";
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'

import { lazy, Suspense } from "react";
import Spinner from './components/Spinner.jsx'

const HomePage = lazy(() => import('./pages/Home.jsx'))
const SearchPage = lazy(() => import('./pages/Search.jsx'))
const NotFoundPage = lazy(() => import('./pages/404.jsx'))
const JobDetail = lazy(() => import('./pages/Detail.jsx'))

function App() {
  
  return (
    <>
      <Header />
      <Suspense fallback={<Spinner/>}>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/search" element={<SearchPage/>} />
          <Route path="/jobs/:jobId" element={<JobDetail/>}/>
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default App