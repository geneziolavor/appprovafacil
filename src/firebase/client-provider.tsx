'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { getAuth } from 'firebase/auth';


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount
  
  const auth = firebaseServices.auth;

  useEffect(() => {
    if (auth) {
      // The onAuthStateChanged listener will handle the user state.
      // We just need to ensure signInAnonymously is called if there's no user.
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          initiateAnonymousSignIn(auth);
        }
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
