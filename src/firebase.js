// ══ FIREBASE SYNC ═══════════════════════════════════════════
import { DB, tod } from './db.js';
import { toast } from './ui/ui.js';

export async function initFirebaseSync() {
  // On app start: pull from Firebase first, then render
  const synced = await syncFromFirebase();
  if(synced) {
    console.log('✓ Data loaded from Firebase');
  }
}

window.syncToFirebase = syncToFirebase;
window.syncFromFirebase = syncFromFirebase;


