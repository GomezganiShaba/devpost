'use client';

import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export interface AuditLog {
  id?: string;
  createdAt: any;
  taskTitle: string;
  redactSource: string;
  reasonSource: string;
  entityCount: number;
  bytesKeptLocal: number;
  latencyMs: number;
  sanitizedPreview: string;
}

export async function saveAuditLog(log: Omit<AuditLog, 'createdAt' | 'id'>) {
  const user = auth.currentUser;
  if (!user) return;

  const logsRef = collection(db, 'users', user.uid, 'auditLogs');
  await addDoc(logsRef, {
    ...log,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const logsRef = collection(db, 'users', user.uid, 'auditLogs');
  const q = query(logsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
    callback(logs);
  });
}