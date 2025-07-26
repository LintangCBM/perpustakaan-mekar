import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'perpustakaan-mekar-1',
        appId: '1:943095116193:web:898beb0b8f4f57720e5be0',
        storageBucket: 'perpustakaan-mekar-1.firebasestorage.app',
        apiKey: 'AIzaSyA8L7bPO0thL9JTA2W2b_8ZYLmuRtGBNYc',
        authDomain: 'perpustakaan-mekar-1.firebaseapp.com',
        messagingSenderId: '943095116193',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
