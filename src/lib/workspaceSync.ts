import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { RebuildOSState } from '../types';
import { INITIAL_STATE, processDailyStreak } from './storage';

export async function fetchUserWorkspace(userId: string): Promise<RebuildOSState | null> {
  try {
    const docRef = doc(db, 'workspaces', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const loadedState: RebuildOSState = {
        ...INITIAL_STATE,
        ...(data.state || {}),
      };
      return processDailyStreak(loadedState);
    }
    return null;
  } catch (error) {
    console.error('Error fetching workspace from Firestore:', error);
    return null;
  }
}

export async function saveUserWorkspace(userId: string, state: RebuildOSState): Promise<void> {
  try {
    const docRef = doc(db, 'workspaces', userId);
    await setDoc(
      docRef,
      {
        userId,
        state,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving workspace to Firestore:', error);
  }
}

export function subscribeToUserWorkspace(
  userId: string,
  onUpdate: (state: RebuildOSState) => void
) {
  const docRef = doc(db, 'workspaces', userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.state) {
          onUpdate(data.state as RebuildOSState);
        }
      }
    },
    (error) => {
      console.error('Workspace subscription error:', error);
    }
  );
}
