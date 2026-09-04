import { useEffect, useRef, useState } from 'react'

import { Pagination } from '../components/Pagination.jsx'
import { SearchFormSection } from '../components/SearchFormSection.jsx'
import { JobListings } from '../components/JobListings.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { ErrorMessage } from '../components/ErrorMessage.jsx'
import { useRouter } from '../hooks/useRouter.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.jsx'

const RESULTS_PER_PAGE = 4
const FILTERS_STORAGE_KEY = 'devjobs:filters'
const SEARCH_TEXT_STORAGE_KEY = 'devjobs:searchText'

const useFilters = () => {
  // Si la URL trae filtros/texto, deben ganar sobre lo guardado en localStorage
  // (para no romper links compartidos). Esto se hace una sola vez, antes de que
  // useLocalStorage lea la clave por primera vez.
  const primedFromUrlRef = useRef(null)
  if (primedFromUrlRef.current == null) {
    primedFromUrlRef.current = true
    const params = new URLSearchParams(window.location.search)

    if (params.has('technology') || params.has('type') || params.has('level')) {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
        technology: params.get('technology') || '',
        location: params.get('type') || '',
        experienceLevel: params.get('level') || ''
      }))
    }

    if (params.has('text')) {
      localStorage.setItem(SEARCH_TEXT_STORAGE_KEY, JSON.stringify(params.get('text') || ''))
    }
  }

  const [filters, setFilters] = useLocalStorage(FILTERS_STORAGE_KEY, (() => {
    const params = new URLSearchParams(window.location.search)
    return {
      technology: params.get('technology') || '',
      location: params.get('type') || '',
      experienceLevel: params.get('level') || ''
    }
  })())
  const [textToFilter, setTextToFilter] = useLocalStorage(
    SEARCH_TEXT_STORAGE_KEY,
    new URLSearchParams(window.location.search).get('text') || ''
  )
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const page = Number(params.get('page'))
    return Number.isNaN(page) ? page : 1
  })

  const hasActiveFilters = Object.values(filters).some( e => e != '');

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const { navigateTo } = useRouter()

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (textToFilter) params.append('text', textToFilter)
        if (filters.technology) params.append('technology', filters.technology)
        if (filters.location) params.append('type', filters.location)
        if (filters.experienceLevel) params.append('level', filters.experienceLevel)

        const offset = (currentPage - 1) * RESULTS_PER_PAGE
        params.append('limit', RESULTS_PER_PAGE)
        params.append('offset', offset)

        const queryParams = params.toString()

        const response = await fetch(`https://jscamp-api.vercel.app/api/jobs?${queryParams}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status} al obtener los empleos`)
        }

        const json = await response.json()

        setJobs(json.data)
        setTotal(json.total)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError(error)
        setJobs([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters, currentPage, textToFilter, retryCount])

  const handleRetry = () => {
    setRetryCount(count => count + 1)
  }

  useEffect(() => {
    const params = new URLSearchParams()

    if (textToFilter) params.append('text', textToFilter)
    if (filters.technology) params.append('technology', filters.technology)
    if (filters.location) params.append('type', filters.location)
    if (filters.experienceLevel) params.append('level', filters.experienceLevel)

    if (currentPage > 1) params.append('page', currentPage)

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    navigateTo(newUrl)
  }, [filters, currentPage, textToFilter, navigateTo])

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (filters) => {
    setFilters(filters)
    setCurrentPage(1)
  }

  const handleTextFilter = (newTextToFilter) => {
    setTextToFilter(newTextToFilter)
    setCurrentPage(1)
  }

  return {
    loading,
    error,
    jobs,
    total,
    totalPages,
    currentPage,
    filters,
    textToFilter,
    handlePageChange,
    handleSearch,
    handleTextFilter,
    handleRetry,
    hasActiveFilters,
  }
}

export function SearchPage() {
  const {
    jobs,
    total,
    loading,
    error,
    totalPages,
    currentPage,
    filters,
    textToFilter,
    handlePageChange,
    handleSearch,
    handleTextFilter,
    handleRetry,
    hasActiveFilters,
  } = useFilters()

  const title = loading
    ? `Cargando... - DevJobs`
    : `Resultados: ${total}, Página ${currentPage} - DevJobs`

  return (
    <main>
      <title>{title}</title>
      <meta name="description" content="Explora miles de oportunidades laborales en el sector tecnológico. Encuentra tu próximo empleo en DevJobs." />

      <SearchFormSection
        initialText={textToFilter}
        filters={filters}
        onSearch={handleSearch}
        onTextFilter={handleTextFilter}
        hasActiveFilters={hasActiveFilters}
      />

      <section>
        <h2 style={{ textAlign: 'center' }}>Resultados de búsqueda</h2>

        {
          error
            ? <ErrorMessage description="No se pudieron cargar los empleos. Inténtalo de nuevo." onRetry={handleRetry} />
            : loading
              ? <Spinner label="Cargando empleos..." />
              : <JobListings jobs={jobs} />
        }
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </main>
  )
}