import { useEffect, useRef, useState } from 'react'

import { Pagination } from '../components/Pagination.jsx'
import { SearchFormSection } from '../components/SearchFormSection.jsx'
import { JobListings } from '../components/JobListings.jsx'
import { ErrorMessage } from '../components/ErrorMessage.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.jsx'
import { useSearchParams } from 'react-router'
import Spinner from '../components/Spinner.jsx'

const RESULTS_PER_PAGE = 4
const FILTERS_STORAGE_KEY = 'devjobs:filters'
const SEARCH_TEXT_STORAGE_KEY = 'devjobs:searchText'

const EMPTY_FILTERS = {
  technology: '',
  location: '',
  experienceLevel: ''
}

const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // Si la URL trae filtros/texto, deben ganar sobre lo guardado en localStorage
  // (para no romper links compartidos). Esto se hace una sola vez, antes de que
  // useLocalStorage lea la clave por primera vez.
  const primedFromUrlRef = useRef(null)
  if (primedFromUrlRef.current == null) {
    primedFromUrlRef.current = true

    if (searchParams.has('technology') || searchParams.has('type') || searchParams.has('level')) {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
        technology: searchParams.get('technology') || '',
        location: searchParams.get('type') || '',
        experienceLevel: searchParams.get('level') || ''
      }))
    }

    if (searchParams.has('text')) {
      localStorage.setItem(SEARCH_TEXT_STORAGE_KEY, JSON.stringify(searchParams.get('text') || ''))
    }
  }

  const [filters, setFilters] = useLocalStorage(FILTERS_STORAGE_KEY, {
    technology: searchParams.get('technology') || '',
    location: searchParams.get('type') || '',
    experienceLevel: searchParams.get('level') || ''
  })

  const [textToFilter, setTextToFilter] = useLocalStorage(
    SEARCH_TEXT_STORAGE_KEY,
    searchParams.get('text') || ''
  )

  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page'))
    return Number.isInteger(page) && page > 0 ? page : 1
  })

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchJobs() {
      try {
        setLoading(true)
        setError(null)

        // Se construyen params nuevos en cada fetch: nunca mutar los de la URL,
        // si no limit/offset acaban filtrándose a la barra de direcciones.
        const query = new URLSearchParams()

        if (textToFilter) query.set('text', textToFilter)
        if (filters.technology) query.set('technology', filters.technology)
        if (filters.location) query.set('type', filters.location)
        if (filters.experienceLevel) query.set('level', filters.experienceLevel)

        const offset = (currentPage - 1) * RESULTS_PER_PAGE
        query.set('limit', RESULTS_PER_PAGE)
        query.set('offset', offset)

        const response = await fetch(
          `https://jscamp-api.vercel.app/api/jobs?${query.toString()}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Error ${response.status} al obtener los empleos`)
        }

        const json = await response.json()

        setJobs(json.data)
        setTotal(json.total)
      } catch (error) {
        if (error.name === 'AbortError') return

        console.error('Error fetching jobs:', error)
        setError(error)
        setJobs([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()

    return () => controller.abort()
  }, [filters, currentPage, textToFilter, retryCount])

  const handleRetry = () => {
    setRetryCount(count => count + 1)
  }

  // Sincroniza el estado -> URL. Cada valor vacío se borra, si no los params
  // quedan pegados para siempre (solo se hacía set, nunca delete).
  useEffect(() => {
    setSearchParams(params => {
      const next = new URLSearchParams(params)

      const syncParam = (key, value) => {
        if (value) next.set(key, value)
        else next.delete(key)
      }

      syncParam('text', textToFilter)
      syncParam('technology', filters.technology)
      syncParam('type', filters.location)
      syncParam('level', filters.experienceLevel)
      syncParam('page', currentPage > 1 ? String(currentPage) : '')

      // limit/offset son detalle de la llamada a la API, no del enlace compartible
      next.delete('limit')
      next.delete('offset')

      return next
    }, { replace: true })
  }, [filters, currentPage, textToFilter, setSearchParams])

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (filters) => {
    setFilters(filters)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS)
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
    handleClearFilters,
    handleTextFilter,
    handleRetry,
    hasActiveFilters,
  }
}

export default function SearchPage() {
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
    handleClearFilters,
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
        onClearFilters={handleClearFilters}
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
