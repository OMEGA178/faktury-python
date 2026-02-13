import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// INSTRUKCJA KONFIGURACJI:
// 1. Wejdź na: https://console.firebase.google.com/
// 2. Kliknij "Add project" lub "Dodaj projekt"
// 3. Nazwij projekt: "gadowski-system-faktur"
// 4. Wyłącz Google Analytics (nie jest potrzebny)
// 5. Po utworzeniu projektu, kliknij ikonę Web (</>) w głównym widoku
// 6. Zarejestruj aplikację jako "Gadowski System"
// 7. Skopiuj konfigurację Firebase i wklej poniżej
// 8. W konsoli Firebase:
//    - Przejdź do "Firestore Database"
//    - Kliknij "Create database"
//    - Wybierz "Start in production mode"
//    - Wybierz lokalizację: europe-west3 (Frankfurt) - najbliżej Polski
// 9. W zakładce "Rules" wklej poniższe reguły:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read, write: if true;
//     }
//   }
// }
//
// UWAGA: Te reguły pozwalają każdemu na odczyt/zapis.
// Dla produkcji dodaj autentykację!

const firebaseConfig = {
  apiKey: "AIzaSyB2ynvGZAXOnDJjvgrBoQig1yqf9H1G9BA",
  authDomain: "gadowski-system-faktur.firebaseapp.com",
  projectId: "gadowski-system-faktur",
  storageBucket: "gadowski-system-faktur.firebasestorage.app",
  messagingSenderId: "890764648224",
  appId: "1:890764648224:web:ec5ef949358126355fc145"
}

// Sprawdź czy konfiguracja została zaktualizowana
const isConfigured = firebaseConfig.apiKey !== "AIza..."

let app
let db

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    console.log('✅ Firebase połączony pomyślnie!')
  } catch (error) {
    console.error('❌ Błąd inicjalizacji Firebase:', error)
    console.log('⚠️ Aplikacja będzie działać TYLKO LOKALNIE bez synchronizacji')
  }
} else {
  console.warn('⚠️ Firebase nie skonfigurowany. Zobacz instrukcję w src/lib/firebase.ts')
  console.log('⚠️ Aplikacja będzie działać TYLKO LOKALNIE bez synchronizacji')
}

export { db, isConfigured }
