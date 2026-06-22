import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#1A0F3C', color: '#F0EEFF', padding: '40px 24px', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#E85454' }}>App Error</h2>
          <pre style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error}
          </pre>
          <p style={{ color: '#9B7EF0', marginTop: '16px', fontSize: '13px' }}>Please screenshot this and share with your developer.</p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
