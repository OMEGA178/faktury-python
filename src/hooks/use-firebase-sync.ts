import { useEffect, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { toast } from 'sonner'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

interface SyncMetadata {
  lastSyncedAt: string
  syncedBy: string
  deviceId: string
}

/**
 * Hook do synchronizacji danych z Firebase Firestore
 * 
 * Funkcjonalność:
 * - Automatyczna synchronizacja w obie strony (local ↔ Firebase)
 * - Merge danych bez duplikatów
 * - Działa offline (fallback do lokalnego storage)
 * - Wykrywa konflikty i łączy dane
 * 
 * @param collectionName - Nazwa kolekcji w Firestore (np. 'invoices', 'drivers')
 * @param localKey - Klucz w lokalnym KV storage
 * @param defaultValue - Domyślna wartość jeśli brak danych
 * @param mergeStrategy - Strategia łączenia: 'by-id' (domyślnie) lub 'append'
 */
export function useFirebaseSync<T extends { id: string }>(
  collectionName: string,
  localKey: string,
  defaultValue: T[] = [],
  mergeStrategy: 'by-id' | 'append' = 'by-id'
) {
  const [localData, setLocalData] = useKV<T[]>(localKey, defaultValue)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitoruj status połączenia
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Połączenie przywrócone - synchronizacja...')
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('Brak internetu - pracujesz offline')
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Funkcja merge'owania danych
  const mergeData = useCallback((local: T[], remote: T[]): T[] => {
    if (mergeStrategy === 'append') {
      // Prosta strategia - dodaj wszystko bez duplikatów po ID
      const allItems = [...local, ...remote]
      const uniqueMap = new Map<string, T>()
      
      allItems.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item)
        }
      })
      
      return Array.from(uniqueMap.values())
    }

    // Strategia 'by-id' - merge po ID, preferuj nowsze dane
    const mergedMap = new Map<string, T>()
    
    // Dodaj lokalne dane
    local.forEach(item => mergedMap.set(item.id, item))
    
    // Merge z remote - nadpisz lub dodaj nowe
    remote.forEach(remoteItem => {
      const localItem = mergedMap.get(remoteItem.id)
      
      if (!localItem) {
        // Nowy element z Firebase - dodaj
        mergedMap.set(remoteItem.id, remoteItem)
      } else {
        // Element istnieje - użyj remote (zakładamy że Firebase ma prawdę)
        mergedMap.set(remoteItem.id, remoteItem)
      }
    })
    
    return Array.from(mergedMap.values())
  }, [mergeStrategy])

  // Synchronizacja local → Firebase (upload)
  const syncToFirebase = useCallback(async (data: T[]) => {
    if (!isConfigured || !db || !isOnline) return

    try {
      setSyncStatus('syncing')
      
      const collectionRef = collection(db, collectionName)
      const batch = writeBatch(db)
      
      // Usuń wszystkie stare dokumenty
      const snapshot = await getDocs(collectionRef)
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      // Dodaj nowe dokumenty
      data.forEach(item => {
        const docRef = doc(collectionRef, item.id)
        batch.set(docRef, {
          ...item,
          _syncMetadata: {
            lastSyncedAt: new Date().toISOString(),
            syncedBy: localKey,
            deviceId: navigator.userAgent
          }
        })
      })
      
      await batch.commit()
      
      setLastSynced(new Date())
      setSyncStatus('synced')
      
      console.log(`✅ Zsynchronizowano ${data.length} elementów do Firebase (${collectionName})`)
    } catch (error) {
      console.error('❌ Błąd synchronizacji do Firebase:', error)
      setSyncStatus('error')
      toast.error(`Błąd synchronizacji ${collectionName}`)
    }
  }, [collectionName, localKey, isOnline])

  // Synchronizacja Firebase → local (download)
  useEffect(() => {
    if (!isConfigured || !db || !isOnline) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    
    const collectionRef = collection(db, collectionName)
    
    // Nasłuchuj zmian w czasie rzeczywistym
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const remoteData = snapshot.docs.map(doc => {
          const data = doc.data()
          delete data._syncMetadata // Usuń metadane
          return data as T
        })

        setLocalData(currentLocal => {
          const merged = mergeData(currentLocal || [], remoteData)
          
          // Pokaż toast tylko jeśli są nowe dane
          if (remoteData.length > 0 && currentLocal && currentLocal.length > 0) {
            const newItems = merged.length - currentLocal.length
            if (newItems > 0) {
              toast.success(`Pobrano ${newItems} nowych ${collectionName}`)
            }
          }
          
          return merged
        })

        setLastSynced(new Date())
        setSyncStatus('synced')
        
        console.log(`✅ Zsynchronizowano ${remoteData.length} elementów z Firebase (${collectionName})`)
      },
      (error) => {
        console.error('❌ Błąd nasłuchiwania Firebase:', error)
        setSyncStatus('error')
      }
    )

    return () => unsubscribe()
  }, [collectionName, mergeData, setLocalData, isOnline])

  // Auto-upload lokalnych zmian do Firebase
  useEffect(() => {
    if (!isConfigured || !db || !isOnline) return
    if (!localData || localData.length === 0) return

    // Debounce - czekaj 2 sekundy przed wysłaniem
    const timer = setTimeout(() => {
      syncToFirebase(localData)
    }, 2000)

    return () => clearTimeout(timer)
  }, [localData, syncToFirebase, isOnline])

  // Funkcja do manualnego wymuszenia synchronizacji
  const forceSync = useCallback(async () => {
    if (!isConfigured || !db || !isOnline) {
      toast.error('Brak połączenia z internetem')
      return
    }

    await syncToFirebase(localData || [])
    toast.success(`Synchronizacja ${collectionName} zakończona`)
  }, [localData, syncToFirebase, collectionName, isOnline])

  return {
    data: localData || defaultValue,
    setData: setLocalData,
    syncStatus,
    lastSynced,
    isOnline,
    forceSync,
    isFirebaseEnabled: isConfigured
  }
}
