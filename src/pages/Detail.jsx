import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import snarkdown from 'snarkdown'
import styles from './Detail.module.css'
import { Link } from "../components/Link";

function JobSection ({ title, content }) {
    const html = snarkdown(content)

    return (
        <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
            {title}
        </h2>

        <div
            className={`${styles.sectionContent} prose`}
            dangerouslySetInnerHTML={{
            __html: html
            }}
        />

        </section>
    )
}

function DetailPageBreadCrumb ({ job }) {
    return (
        <div className={styles.container}>
        <nav className={styles.breadcrumb}>
            <Link 
            href="/search"
            className={styles.breadcrumbButton}
            >
            Empleos
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{job.titulo}</span>
        </nav>
        </div>
    )
}

function DetailPageHeader ({ job }) {
    return (
        <>
        <header className={styles.header}>
            <h1 className={styles.title}>
            {job.titulo}
            </h1>
            <p className={styles.meta}>
            {job.empresa} · {job.ubicacion}
            </p>
        </header>

        <DetailApplyButton />
        {/* <DetailFavoriteButton jobId={job.id} /> */}
        </>
    )
}

function DetailApplyButton () {
    // const { isLoggedIn } = useAuthStore()

    return (
        <button className={styles.applyButton}>
        {"Aplicar"}
        </button>
    )
}

// function DetailFavoriteButton ({ jobId }) {
//     const { isFavorite, toggleFavorite } = useFavoritesStore()

//     return (
//         <button
//         onClick={() => toggleFavorite(jobId)}
//         aria-label={isFavorite(jobId) ? 'Remove from favorites' : 'Add to favorites'}
//         >
//         {isFavorite(jobId) ? '❤️' : '🤍'}
//         </button>
//     )
// }


export default function JobDetail () {
    const { jobId } = useParams()
    const navigate = useNavigate()

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error , setError] = useState(null)

    useEffect(() => {
    fetch(`https://jscamp-api.vercel.app/api/jobs/${jobId}`)
        .then(response => {
            if (!response.ok) {
            navigate('/not-found')
            }

            return response.json()
        })
        .then(json => {
            setJob(json)
        })
        .catch(err => {
            setError(err.message)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [jobId])

    if (loading) {
        <Spinner label={`Cargando empleo... ${id}`} />
    }

    if (error || !job) {
        return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
            <div className={styles.error}>
            <h2 className={styles.errorTitle}>
                Oferta no encontrada
            </h2>
            <button
                onClick={() => navigate('/')}
                className={styles.errorButton}
            >
                Volver al inicio
            </button>
            </div>
        </div>
        )
    }
    return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <DetailPageBreadCrumb job={job} />
        <DetailPageHeader job={job} />

        <JobSection title="Descripción del puesto" content={job.content.description} />
        <JobSection title="Responsabilidades" content={job.content.responsibilities} />
        <JobSection title="Requisitios" content={job.content.requirements} />
        <JobSection title="Acerca de la empresa" content={job.content.about} />
    </div>
    )
}