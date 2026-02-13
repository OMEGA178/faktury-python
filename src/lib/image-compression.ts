/**
 * Kompresja i zarządzanie zdjęciami faktur
 * Zapisuje skompresowane zdjęcia w localStorage aby były bezpieczne
 */

const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const QUALITY = 0.85
const STORAGE_KEY_PREFIX = 'invoice_image_'

/**
 * Kompresuje obraz do określonego rozmiaru i jakości
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Oblicz nowe wymiary zachowując proporcje
          let width = img.width
          let height = img.height
          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
            width = Math.floor(width * ratio)
            height = Math.floor(height * ratio)
          }
          
          // Utwórz canvas do kompresji
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Nie można utworzyć kontekstu canvas'))
            return
          }
          
          // Wypełnij białym tłem (dla przezroczystych PNG)
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
          
          // Narysuj obraz
          ctx.drawImage(img, 0, 0, width, height)
          
          // Konwertuj do JPEG z kompresją
          const compressedDataUrl = canvas.toDataURL('image/jpeg', QUALITY)
          
          // Zapisz w localStorage z unikalnym ID
          const imageId = generateImageId()
          saveImageToStorage(imageId, compressedDataUrl)
          
          // Zwróć ID obrazu (nie cały base64, oszczędność pamięci w Firebase)
          resolve(imageId)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Nie można załadować obrazu'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Nie można odczytać pliku'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Kompresuje wiele obrazów jednocześnie
 */
export async function compressMultipleImages(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files)
  const promises = fileArray.map(file => compressImage(file))
  return Promise.all(promises)
}

/**
 * Generuje unikalne ID dla obrazu
 */
function generateImageId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${STORAGE_KEY_PREFIX}${timestamp}_${random}`
}

/**
 * Zapisuje obraz w localStorage
 */
function saveImageToStorage(imageId: string, dataUrl: string): void {
  try {
    localStorage.setItem(imageId, dataUrl)
  } catch (error) {
    console.error('Błąd zapisu obrazu do localStorage:', error)
    // Jeśli localStorage jest pełny, usuń najstarsze obrazy
    cleanupOldImages()
    // Spróbuj ponownie
    try {
      localStorage.setItem(imageId, dataUrl)
    } catch (retryError) {
      console.error('Nie można zapisać obrazu nawet po czyszczeniu:', retryError)
    }
  }
}

/**
 * Pobiera obraz z localStorage
 */
export function getImageFromStorage(imageId: string): string | null {
  try {
    return localStorage.getItem(imageId)
  } catch (error) {
    console.error('Błąd odczytu obrazu z localStorage:', error)
    return null
  }
}

/**
 * Usuwa obraz z localStorage
 */
export function removeImageFromStorage(imageId: string): void {
  try {
    localStorage.removeItem(imageId)
  } catch (error) {
    console.error('Błąd usuwania obrazu z localStorage:', error)
  }
}

/**
 * Usuwa wiele obrazów z localStorage
 */
export function removeMultipleImagesFromStorage(imageIds: string[]): void {
  imageIds.forEach(id => removeImageFromStorage(id))
}

/**
 * Usuwa najstarsze obrazy aby zwolnić miejsce
 */
function cleanupOldImages(): void {
  try {
    const imageKeys: { key: string; timestamp: number }[] = []
    
    // Znajdź wszystkie klucze obrazów
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        // Wyciągnij timestamp z klucza
        const parts = key.split('_')
        const timestamp = parseInt(parts[1] || '0')
        imageKeys.push({ key, timestamp })
      }
    }
    
    // Sortuj po timestamp (najstarsze pierwsze)
    imageKeys.sort((a, b) => a.timestamp - b.timestamp)
    
    // Usuń 20% najstarszych obrazów
    const toRemove = Math.ceil(imageKeys.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(imageKeys[i].key)
    }
    
    console.log(`Usunięto ${toRemove} najstarszych obrazów z localStorage`)
  } catch (error) {
    console.error('Błąd podczas czyszczenia starych obrazów:', error)
  }
}

/**
 * Pobiera statystyki użycia pamięci localStorage
 */
export function getStorageStats(): {
  totalImages: number
  estimatedSizeMB: number
  availableSpaceMB: number
} {
  let totalImages = 0
  let totalSize = 0
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        totalImages++
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length * 2 // UTF-16, każdy znak to 2 bajty
        }
      }
    }
  } catch (error) {
    console.error('Błąd podczas obliczania statystyk:', error)
  }
  
  const estimatedSizeMB = totalSize / (1024 * 1024)
  const availableSpaceMB = 5 - estimatedSizeMB // localStorage ma ~5-10MB limitu
  
  return {
    totalImages,
    estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
    availableSpaceMB: Math.max(0, Math.round(availableSpaceMB * 100) / 100)
  }
}

/**
 * Konwertuje stare base64 obrazy do nowego systemu (migracja)
 */
export function migrateOldImagesToStorage(base64Images: string[]): string[] {
  return base64Images.map(base64 => {
    // Jeśli już jest w formacie ID, zwróć bez zmian
    if (base64.startsWith(STORAGE_KEY_PREFIX)) {
      return base64
    }
    
    // W przeciwnym razie zapisz w localStorage i zwróć ID
    const imageId = generateImageId()
    saveImageToStorage(imageId, base64)
    return imageId
  })
}

/**
 * Rozwiązuje ID obrazu na URL do wyświetlenia
 * Obsługuje zarówno nowe ID jak i stare base64 URL
 */
export function resolveImageUrl(imageIdOrBase64: string): string | null {
  // Jeśli to ID, pobierz z localStorage
  if (imageIdOrBase64.startsWith(STORAGE_KEY_PREFIX)) {
    return getImageFromStorage(imageIdOrBase64)
  }
  
  // Jeśli to już base64 URL, zwróć bez zmian
  if (imageIdOrBase64.startsWith('data:image/')) {
    return imageIdOrBase64
  }
  
  return null
}

/**
 * Rozwiązuje wiele ID obrazów na URL
 */
export function resolveMultipleImageUrls(imageIds: string[]): string[] {
  return imageIds
    .map(id => resolveImageUrl(id))
    .filter((url): url is string => url !== null)
}
