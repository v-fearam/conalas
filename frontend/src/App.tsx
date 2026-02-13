import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000'

function App() {
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app">
      <h1>Conalas</h1>
      <div className="card">
        <h2>Backend Health Check</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {healthStatus === null && !error && <p>Checking...</p>}
        {healthStatus !== null && (
          <p style={{ color: healthStatus ? 'green' : 'red' }}>
            Status: {healthStatus ? 'OK' : 'DOWN'}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
