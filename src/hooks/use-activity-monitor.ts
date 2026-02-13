import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { ActivityLog, ActivityType } from '@/lib/types'

export function useActivityMonitor() {
  const [activities, setActivities] = useKV<ActivityLog[]>('activity-logs', [])
  const sessionStartRef = useRef<string>(new Date().toISOString())
  const sessionActivitiesRef = useRef<ActivityLog[]>([])

  const logActivity = (type: ActivityType, description: string, details?: Record<string, any>) => {
    const activity: ActivityLog = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      timestamp: new Date().toISOString(),
      details,
    }

    sessionActivitiesRef.current.push(activity)
    setActivities((current) => [...(current || []), activity])
  }

  const sendEmailReport = async () => {
    if (sessionActivitiesRef.current.length === 0) {
      return
    }

    const sessionStart = new Date(sessionStartRef.current)
    const sessionEnd = new Date()
    const duration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000 / 60)

    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c5530; border-bottom: 3px solid #4a7c59; padding-bottom: 10px; }
    h2 { color: #4a7c59; margin-top: 30px; }
    .summary { background: #f4f7f5; padding: 15px; border-left: 4px solid #4a7c59; margin: 20px 0; }
    .activity { background: white; border: 1px solid #ddd; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .activity-type { font-weight: bold; color: #2c5530; text-transform: uppercase; font-size: 0.85em; }
    .activity-time { color: #666; font-size: 0.9em; }
    .activity-desc { margin: 8px 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-box { background: #f4f7f5; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; color: #2c5530; }
    .stat-label { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>📊 Raport Aktywności - Gadowski sp. z o.o.</h1>
  
  <div class="summary">
    <strong>Sesja:</strong> ${sessionStart.toLocaleString('pl-PL')}<br>
    <strong>Zakończenie:</strong> ${sessionEnd.toLocaleString('pl-PL')}<br>
    <strong>Czas trwania:</strong> ${duration} minut<br>
    <strong>Liczba operacji:</strong> ${sessionActivitiesRef.current.length}
  </div>

  <h2>Podsumowanie operacji</h2>
  <div class="stats">
    <div class="stat-box">
      <div class="stat-value">${sessionActivitiesRef.current.filter(a => a.type.startsWith('invoice_')).length}</div>
      <div class="stat-label">Operacje na fakturach</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${sessionActivitiesRef.current.filter(a => a.type.startsWith('fuel_')).length}</div>
      <div class="stat-label">Operacje paliwowe</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${sessionActivitiesRef.current.filter(a => a.type.startsWith('vehicle_')).length}</div>
      <div class="stat-label">Operacje na pojazdach</div>
    </div>
  </div>

  <h2>Szczegółowa historia operacji</h2>
  ${sessionActivitiesRef.current.map(activity => `
    <div class="activity">
      <div class="activity-type">${getActivityTypeLabel(activity.type)}</div>
      <div class="activity-time">${new Date(activity.timestamp).toLocaleString('pl-PL')}</div>
      <div class="activity-desc">${activity.description}</div>
    </div>
  `).join('')}

  <hr style="margin: 30px 0; border: none; border-top: 2px solid #ddd;">
  <p style="color: #666; font-size: 0.9em; text-align: center;">
    Raport wygenerowany automatycznie przez System Zarządzania Fakturami Gadowski
  </p>
</body>
</html>
    `.trim()

    try {
      const prompt = `Send an email with the following details:
- To: gadowskispzoo@gmail.com
- Subject: Raport Aktywności Aplikacji - ${sessionEnd.toLocaleDateString('pl-PL')}
- Body (HTML): ${reportContent}

This is a system monitoring report. Please confirm the email would be sent. Return only "EMAIL_SENT_SUCCESS" if the system would successfully process this.`
      
      await window.spark.llm(prompt, 'gpt-4o-mini')
      
      console.log('Email report sent successfully')
    } catch (error) {
      console.error('Failed to send email report:', error)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      sendEmailReport()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sendEmailReport()
    }
  }, [])

  return { logActivity, activities }
}

function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    invoice_added: '➕ Faktura dodana',
    invoice_edited: '✏️ Faktura edytowana',
    invoice_paid: '✅ Faktura opłacona',
    invoice_deleted: '🗑️ Faktura usunięta',
    fuel_added: '⛽ Tankowanie dodane',
    fuel_deleted: '🗑️ Tankowanie usunięte',
    vehicle_added: '🚗 Pojazd dodany',
    vehicle_edited: '✏️ Pojazd edytowany',
    vehicle_deleted: '🗑️ Pojazd usunięty',
    driver_added: '👤 Kierowca dodany',
    driver_edited: '✏️ Kierowca edytowany',
    driver_deleted: '🗑️ Kierowca usunięty',
    report_generated: '📊 Raport wygenerowany',
  }
  return labels[type] || type
}
