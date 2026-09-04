import { Component } from 'react'
import { ErrorMessage } from './ErrorMessage.jsx'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  componentDidCatch (error, info) {
    console.error('Uncaught error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render () {
    if (this.state.hasError) {
      return (
        <main>
          <ErrorMessage
            title="Ha ocurrido un error inesperado"
            description="Por favor recarga la página o inténtalo más tarde."
            onRetry={this.handleReload}
          />
        </main>
      )
    }

    return this.props.children
  }
}
