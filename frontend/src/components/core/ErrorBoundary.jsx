import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', { error: error?.message, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#eab308' }}>
          <h2>Algo salió mal</h2>
          <p style={{ color: '#9ca3af' }}>Recarga la página o vuelve al inicio.</p>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '1rem', padding: '10px 20px', background: '#eab308', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#000', fontWeight: 600 }}
          >
            Ir al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
