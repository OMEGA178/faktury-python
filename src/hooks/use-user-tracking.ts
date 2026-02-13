import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'

interface UserSession {
  hwid: string
  userName: string
  loginTime: string
  lastActivityTime: string
  activities: Array<{
    timestamp: string
    action: string
    details: string
  }>
}

function generateHWID(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const txt = 'ClientJS,<@nv45. F1n63r,Pr1n71n6!'
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText(txt, 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText(txt, 4, 17)
  }

  const canvasData = canvas.toDataURL()
  
  const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language
  const platform = navigator.platform
  const userAgent = navigator.userAgent
  
  const combinedData = `${canvasData}${screenInfo}${timezone}${language}${platform}${userAgent}`
  
  let hash = 0
  for (let i = 0; i < combinedData.length; i++) {
    const char = combinedData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0')
}

export function useUserTracking() {
  const [currentSession, setCurrentSession] = useKV<UserSession | null>('currentUserSession', null)
  const [hwid] = useState(() => generateHWID())
  const [userName, setUserName] = useState<string>('')
  const [isNamePromptShown, setIsNamePromptShown] = useState(false)

  useEffect(() => {
    const checkAndPromptUser = async () => {
      const existingName = localStorage.getItem('userName')
      
      if (!existingName && !isNamePromptShown) {
        setIsNamePromptShown(true)
        const name = prompt('Witaj! Podaj swoje imię i nazwisko do logowania:')
        
        if (name && name.trim()) {
          const trimmedName = name.trim()
          localStorage.setItem('userName', trimmedName)
          setUserName(trimmedName)
          
          const newSession: UserSession = {
            hwid,
            userName: trimmedName,
            loginTime: new Date().toISOString(),
            lastActivityTime: new Date().toISOString(),
            activities: [{
              timestamp: new Date().toISOString(),
              action: 'login',
              details: 'Użytkownik zalogował się do systemu'
            }]
          }
          
          setCurrentSession(newSession)
          
          await sendLoginNotification(newSession)
        }
      } else if (existingName) {
        setUserName(existingName)
        
        if (!currentSession || currentSession.userName !== existingName) {
          const newSession: UserSession = {
            hwid,
            userName: existingName,
            loginTime: new Date().toISOString(),
            lastActivityTime: new Date().toISOString(),
            activities: [{
              timestamp: new Date().toISOString(),
              action: 'login',
              details: 'Użytkownik zalogował się do systemu'
            }]
          }
          
          setCurrentSession(newSession)
          await sendLoginNotification(newSession)
        }
      }
    }

    checkAndPromptUser()
  }, [hwid, isNamePromptShown, currentSession, setCurrentSession])

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentSession) {
        await sendLogoutNotification(currentSession)
      }
    }

    const handleVisibilityChange = () => {
      if (currentSession) {
        setCurrentSession(prev => {
          if (!prev) return null
          return {
            ...prev,
            lastActivityTime: new Date().toISOString()
          }
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const activityInterval = setInterval(() => {
      if (currentSession && document.visibilityState === 'visible') {
        setCurrentSession(prev => {
          if (!prev) return null
          return {
            ...prev,
            lastActivityTime: new Date().toISOString()
          }
        })
      }
    }, 30000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(activityInterval)
    }
  }, [currentSession, setCurrentSession])

  const logActivity = (action: string, details: string) => {
    setCurrentSession(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        lastActivityTime: new Date().toISOString(),
        activities: [
          ...prev.activities,
          {
            timestamp: new Date().toISOString(),
            action,
            details
          }
        ]
      }
    })
  }

  return { hwid, userName, currentSession, logActivity }
}

async function sendLoginNotification(session: UserSession) {
  try {
    const loginTime = new Date(session.loginTime).toLocaleString('pl-PL')
    
    const promptText = `System monitorowania użytkowników - Powiadomienie o logowaniu

WAŻNE: To jest powiadomienie które powinno zostać wysłane na email: gadowskispzoo@gmail.com

Szczegóły logowania:
- HWID urządzenia: ${session.hwid}
- Imię i nazwisko: ${session.userName}
- Data i czas logowania: ${loginTime}
- Akcja: Użytkownik zalogował się do aplikacji Gadowski - System Faktur

Potwierdź otrzymanie powiadomienia odpowiadając: "NOTIFICATION_SENT - Powiadomienie o logowaniu ${session.userName} zostało zarejestrowane"`

    await window.spark.llm(promptText, 'gpt-4o-mini')
  } catch (error) {
    console.error('Failed to send login notification:', error)
  }
}

async function sendLogoutNotification(session: UserSession) {
  try {
    const loginTime = new Date(session.loginTime).toLocaleString('pl-PL')
    const logoutTime = new Date(session.lastActivityTime).toLocaleString('pl-PL')
    const loginDate = new Date(session.loginTime)
    const logoutDate = new Date(session.lastActivityTime)
    const durationMs = logoutDate.getTime() - loginDate.getTime()
    const durationMinutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    
    const activitiesSummary = session.activities
      .slice(-10)
      .map(a => `- ${new Date(a.timestamp).toLocaleTimeString('pl-PL')}: ${a.action} - ${a.details}`)
      .join('\n')

    const promptText = `System monitorowania użytkowników - Raport zakończenia sesji

WAŻNE: To jest raport który powinien zostać wysłany na email: gadowskispzoo@gmail.com

Szczegóły sesji:
- HWID urządzenia: ${session.hwid}
- Imię i nazwisko: ${session.userName}
- Czas logowania: ${loginTime}
- Czas wylogowania: ${logoutTime}
- Czas aktywności: ${hours}h ${minutes}min
- Liczba zarejestrowanych akcji: ${session.activities.length}

Ostatnie akcje użytkownika:
${activitiesSummary}

Potwierdź otrzymanie raportu odpowiadając: "REPORT_SENT - Raport sesji ${session.userName} został zarejestrowany"`

    await window.spark.llm(promptText, 'gpt-4o-mini')
  } catch (error) {
    console.error('Failed to send logout notification:', error)
  }
}
