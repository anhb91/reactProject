import { useId, useEffect, useRef } from "react"

const useSearchForm = ({ idTechnology, idLocation, idExperienceLevel, idText, onSearch, onTextFilter }) => {
  const timeoutId = useRef(null)

  const cancelPendingTextFilter = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
      timeoutId.current = null
    }
  }

  useEffect(() => cancelPendingTextFilter, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    if (event.target.name === idText) {
      return // ya lo manejamos en onChange
    }

    const filters = {
      technology: formData.get(idTechnology),
      location: formData.get(idLocation),
      experienceLevel: formData.get(idExperienceLevel)
    }

    onSearch(filters)
  }

  const handleTextChange = (event) => {
    const text = event.target.value

    // Debounce: Cancelar el timeout anterior
    cancelPendingTextFilter()

    timeoutId.current = setTimeout(() => {
      onTextFilter(text)
    }, 500)
  }

  return {
    handleSubmit,
    handleTextChange,
    cancelPendingTextFilter
  }
}

export function SearchFormSection ({ onTextFilter, onSearch, onClearFilters, initialText, filters = {}, hasActiveFilters }) {
  const idText = useId()
  const idTechnology = useId()
  const idLocation = useId()
  const idExperienceLevel = useId()

  const technologyRef = useRef()
  const locationRef = useRef()
  const experienceLevelRef = useRef()
  const inputRef = useRef()

  const {
    handleSubmit,
    handleTextChange,
    cancelPendingTextFilter
  } = useSearchForm({ idTechnology, idLocation, idExperienceLevel, idText, onSearch, onTextFilter })

  const handleClearInput = (event) => {
    event.preventDefault()

    // Si no se cancela, un debounce en vuelo vuelve a poner el texto anterior
    cancelPendingTextFilter()

    inputRef.current.value = ""
    onTextFilter("")
  }

  const handleClearFilter = (event) => {
    event.preventDefault()

    technologyRef.current.value = ''
    locationRef.current.value = ''
    experienceLevelRef.current.value = ''

    onClearFilters()
  }


  return (
    <section className="jobs-search">
      <h1>Encuentra tu próximo trabajo</h1>
      <p>Explora miles de oportunidades en el sector tecnológico.</p>

      <form onChange={handleSubmit} id="empleos-search-form" role="search">

        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-search">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>

          <input
            ref={inputRef}
            name={idText} id="empleos-search-input" type="text"
            placeholder="Buscar trabajos, empresas o habilidades"
            onChange={handleTextChange}
            defaultValue={initialText}
          />

          <button type="button" onClick={handleClearInput}>
           ✖︎
          </button>
        </div>

        <div className="search-filters">
          <select ref={technologyRef} name={idTechnology} id="filter-technology" defaultValue={filters.technology}>
            <option value="">Tecnología</option>
            <optgroup label="Tecnologías populares">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="react">React</option>
              <option value="nodejs">Node.js</option>
            </optgroup>
            <option value="java">Java</option>
            <hr />
            <option value="csharp">C#</option>
            <option value="c">C</option>
            <option value="c++">C++</option>
            <hr />
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
          </select>

          <select ref={locationRef} name={idLocation} id="filter-location" defaultValue={filters.location}>
            <option value="">Ubicación</option>
            <option value="remoto">Remoto</option>
            <option value="cdmx">Ciudad de México</option>
            <option value="guadalajara">Guadalajara</option>
            <option value="monterrey">Monterrey</option>
            <option value="barcelona">Barcelona</option>
          </select>

          <select ref={experienceLevelRef} name={idExperienceLevel} id="filter-experience-level" defaultValue={filters.experienceLevel}>
            <option value="">Nivel de experiencia</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
          {hasActiveFilters && <button type="button" onClick={handleClearFilter} className="btn-clear-filters">
            clear filters
          </button>}
        </div>
      </form>

      <span id="filter-selected-value"></span>
    </section>
  )
}
