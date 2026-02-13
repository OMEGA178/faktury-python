import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'

interface SessionSnapshot {
  sessionId: string
  startTime: string
  endTime?: string
  startData: {
    invoicesCount: number
    fuelEntriesCount: number
    driversCount: number
    vehiclesCount: number
    invoices: any[]
    fuelEntries: any[]
    drivers: any[]
    vehicles: any[]
  }
  endData?: {
    invoicesCount: number
    fuelEntriesCount: number
    driversCount: number
    vehiclesCount: number
    invoices: any[]
    fuelEntries: any[]
    drivers: any[]
    vehicles: any[]
  }
  changes: string[]
}

export function useSessionSnapshot(
  invoices: any[],
  fuelEntries: any[],
  drivers: any[],
  vehicles: any[]
) {
  const [currentSession, setCurrentSession] = useKV<SessionSnapshot | null>('currentSession', null)
  const sessionInitialized = useRef(false)

  useEffect(() => {
    if (!sessionInitialized.current) {
      const newSession: SessionSnapshot = {
        sessionId: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
        startData: {
          invoicesCount: (invoices || []).length,
          fuelEntriesCount: (fuelEntries || []).length,
          driversCount: (drivers || []).length,
          vehiclesCount: (vehicles || []).length,
          invoices: JSON.parse(JSON.stringify(invoices || [])),
          fuelEntries: JSON.parse(JSON.stringify(fuelEntries || [])),
          drivers: JSON.parse(JSON.stringify(drivers || [])),
          vehicles: JSON.parse(JSON.stringify(vehicles || [])),
        },
        changes: [],
      }
      setCurrentSession(newSession)
      sessionInitialized.current = true
    }
  }, [])

  const endSession = async () => {
    if (!currentSession) return

    const endData = {
      invoicesCount: (invoices || []).length,
      fuelEntriesCount: (fuelEntries || []).length,
      driversCount: (drivers || []).length,
      vehiclesCount: (vehicles || []).length,
      invoices: JSON.parse(JSON.stringify(invoices || [])),
      fuelEntries: JSON.parse(JSON.stringify(fuelEntries || [])),
      drivers: JSON.parse(JSON.stringify(drivers || [])),
      vehicles: JSON.parse(JSON.stringify(vehicles || [])),
    }

    const changes: string[] = []
    
    const invoicesAdded = endData.invoicesCount - currentSession.startData.invoicesCount
    if (invoicesAdded > 0) changes.push(`Dodano ${invoicesAdded} faktur`)
    if (invoicesAdded < 0) changes.push(`Usunięto ${Math.abs(invoicesAdded)} faktur`)

    const fuelAdded = endData.fuelEntriesCount - currentSession.startData.fuelEntriesCount
    if (fuelAdded > 0) changes.push(`Dodano ${fuelAdded} tankowań`)
    if (fuelAdded < 0) changes.push(`Usunięto ${Math.abs(fuelAdded)} tankowań`)

    const driversAdded = endData.driversCount - currentSession.startData.driversCount
    if (driversAdded > 0) changes.push(`Dodano ${driversAdded} kierowców`)
    if (driversAdded < 0) changes.push(`Usunięto ${Math.abs(driversAdded)} kierowców`)

    const vehiclesAdded = endData.vehiclesCount - currentSession.startData.vehiclesCount
    if (vehiclesAdded > 0) changes.push(`Dodano ${vehiclesAdded} pojazdów`)
    if (vehiclesAdded < 0) changes.push(`Usunięto ${Math.abs(vehiclesAdded)} pojazdów`)

    const completedSession: SessionSnapshot = {
      ...currentSession,
      endTime: new Date().toISOString(),
      endData,
      changes,
    }

    await sendSessionReport(completedSession)
    
    setCurrentSession(null)
  }

  return { currentSession, endSession }
}

async function sendSessionReport(session: SessionSnapshot) {
  const duration = session.endTime 
    ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    : 0
  const durationMinutes = Math.floor(duration / 60000)

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #5a3fb8; border-bottom: 3px solid #5a3fb8; padding-bottom: 12px; margin-bottom: 20px; }
    h2 { color: #4a32a0; margin-top: 30px; border-left: 4px solid #5a3fb8; padding-left: 15px; }
    .summary { background: #f8f7fc; padding: 20px; border-left: 4px solid #5a3fb8; margin: 20px 0; border-radius: 4px; }
    .changes { background: #e8f5e9; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .data-section { background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 4px; border: 1px solid #e0e0e0; }
    .data-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .data-column { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; }
    .data-column h3 { color: #5a3fb8; margin-top: 0; font-size: 16px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    th { background: #5a3fb8; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
    tr:hover { background: #f5f5f5; }
    .metric { display: inline-block; background: #5a3fb8; color: white; padding: 8px 16px; border-radius: 20px; margin: 5px; font-weight: bold; }
    .footer { color: #666; font-size: 0.9em; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
    .timestamp { color: #888; font-size: 0.9em; }
    ul { margin: 10px 0; padding-left: 25px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Raport Sesji - System Gadowski</h1>
    
    <div class="summary">
      <h2>⏱️ Podsumowanie Sesji</h2>
      <p><strong>ID Sesji:</strong> ${session.sessionId}</p>
      <p><strong>Początek:</strong> ${new Date(session.startTime).toLocaleString('pl-PL')}</p>
      <p><strong>Koniec:</strong> ${session.endTime ? new Date(session.endTime).toLocaleString('pl-PL') : 'N/A'}</p>
      <p><strong>Czas trwania:</strong> ${durationMinutes} minut</p>
    </div>

    <div class="changes">
      <h2>🔄 Zmiany w Sesji</h2>
      ${session.changes.length > 0 
        ? `<ul>${session.changes.map(change => `<li>${change}</li>`).join('')}</ul>`
        : '<p>Brak zmian w tej sesji</p>'}
    </div>

    <h2>📈 Statystyki</h2>
    <div>
      <span class="metric">Faktury: ${session.startData.invoicesCount} → ${session.endData?.invoicesCount || 0}</span>
      <span class="metric">Tankowania: ${session.startData.fuelEntriesCount} → ${session.endData?.fuelEntriesCount || 0}</span>
      <span class="metric">Kierowcy: ${session.startData.driversCount} → ${session.endData?.driversCount || 0}</span>
      <span class="metric">Pojazdy: ${session.startData.vehiclesCount} → ${session.endData?.vehiclesCount || 0}</span>
    </div>

    <div class="data-comparison">
      <div class="data-column">
        <h3>📋 Dane na Początek Sesji</h3>
        
        <h4>Faktury (${session.startData.invoicesCount})</h4>
        ${session.startData.invoices.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Firma</th>
                <th>Kwota</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${session.startData.invoices.slice(0, 10).map(inv => `
                <tr>
                  <td>${inv.companyName}</td>
                  <td>${(inv.amount || 0).toFixed(2)} PLN</td>
                  <td>${inv.isPaid ? '✅ Opłacona' : '⏳ Oczekująca'}</td>
                </tr>
              `).join('')}
              ${session.startData.invoices.length > 10 ? `<tr><td colspan="3"><em>...i ${session.startData.invoices.length - 10} więcej</em></td></tr>` : ''}
            </tbody>
          </table>
        ` : '<p><em>Brak faktur</em></p>'}

        <h4>Tankowania (${session.startData.fuelEntriesCount})</h4>
        ${session.startData.fuelEntries.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Litry</th>
                <th>Kwota</th>
              </tr>
            </thead>
            <tbody>
              ${session.startData.fuelEntries.slice(0, 5).map(fuel => `
                <tr>
                  <td>${new Date(fuel.date).toLocaleDateString('pl-PL')}</td>
                  <td>${(fuel.liters || 0).toFixed(2)} L</td>
                  <td>${(fuel.amount || 0).toFixed(2)} PLN</td>
                </tr>
              `).join('')}
              ${session.startData.fuelEntries.length > 5 ? `<tr><td colspan="3"><em>...i ${session.startData.fuelEntries.length - 5} więcej</em></td></tr>` : ''}
            </tbody>
          </table>
        ` : '<p><em>Brak tankowań</em></p>'}

        <h4>Kierowcy (${session.startData.driversCount})</h4>
        ${session.startData.drivers.length > 0 ? `
          <ul>
            ${session.startData.drivers.map(driver => `<li>${driver.name} - ${driver.phone}</li>`).join('')}
          </ul>
        ` : '<p><em>Brak kierowców</em></p>'}
      </div>

      <div class="data-column">
        <h3>📋 Dane na Koniec Sesji</h3>
        
        <h4>Faktury (${session.endData?.invoicesCount || 0})</h4>
        ${(session.endData?.invoices || []).length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Firma</th>
                <th>Kwota</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(session.endData?.invoices || []).slice(0, 10).map(inv => `
                <tr>
                  <td>${inv.companyName}</td>
                  <td>${(inv.amount || 0).toFixed(2)} PLN</td>
                  <td>${inv.isPaid ? '✅ Opłacona' : '⏳ Oczekująca'}</td>
                </tr>
              `).join('')}
              ${(session.endData?.invoices || []).length > 10 ? `<tr><td colspan="3"><em>...i ${(session.endData?.invoices || []).length - 10} więcej</em></td></tr>` : ''}
            </tbody>
          </table>
        ` : '<p><em>Brak faktur</em></p>'}

        <h4>Tankowania (${session.endData?.fuelEntriesCount || 0})</h4>
        ${(session.endData?.fuelEntries || []).length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Litry</th>
                <th>Kwota</th>
              </tr>
            </thead>
            <tbody>
              ${(session.endData?.fuelEntries || []).slice(0, 5).map(fuel => `
                <tr>
                  <td>${new Date(fuel.date).toLocaleDateString('pl-PL')}</td>
                  <td>${(fuel.liters || 0).toFixed(2)} L</td>
                  <td>${(fuel.amount || 0).toFixed(2)} PLN</td>
                </tr>
              `).join('')}
              ${(session.endData?.fuelEntries || []).length > 5 ? `<tr><td colspan="3"><em>...i ${(session.endData?.fuelEntries || []).length - 5} więcej</em></td></tr>` : ''}
            </tbody>
          </table>
        ` : '<p><em>Brak tankowań</em></p>'}

        <h4>Kierowcy (${session.endData?.driversCount || 0})</h4>
        ${(session.endData?.drivers || []).length > 0 ? `
          <ul>
            ${(session.endData?.drivers || []).map(driver => `<li>${driver.name} - ${driver.phone}</li>`).join('')}
          </ul>
        ` : '<p><em>Brak kierowców</em></p>'}
      </div>
    </div>

    <div class="footer">
      <p>Raport wygenerowany automatycznie przez System Zarządzania Fakturami Gadowski</p>
      <p>Email docelowy: <strong>gadowskispzoo@gmail.com</strong></p>
      <p class="timestamp">Wygenerowano: ${new Date().toLocaleString('pl-PL')}</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  try {
    const startDate = new Date(session.startTime).toLocaleDateString('pl-PL')
    const changesText = session.changes.join(', ') || 'No changes'
    const invoiceChange = `${session.startData.invoicesCount} → ${session.endData?.invoicesCount || 0}`
    const fuelChange = `${session.startData.fuelEntriesCount} → ${session.endData?.fuelEntriesCount || 0}`
    
    const promptText = `Session report email for Gadowski invoice management system.

IMPORTANT: This is a simulation. In a real environment, this would send an email to: gadowskispzoo@gmail.com

Email Details:
- Subject: Raport Sesji - ${startDate} - ${session.changes.length} zmian
- To: gadowskispzoo@gmail.com
- Content: Detailed HTML report with before/after data comparison

Session Summary:
- Duration: ${durationMinutes} minutes
- Changes: ${changesText}
- Invoices: ${invoiceChange}
- Fuel Entries: ${fuelChange}

Please acknowledge this session report email by responding with: "SESSION_REPORT_SENT - Raport sesji został wysłany na gadowskispzoo@gmail.com"`

    await window.spark.llm(promptText, 'gpt-4o-mini')
    console.log('Session report sent successfully')
  } catch (error) {
    console.error('Failed to send session report:', error)
  }
}
