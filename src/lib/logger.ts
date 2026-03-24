import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface AuditLog {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
  type: 'access' | 'modify' | 'delete' | 'security_alert';
}

/**
 * Logs a sensitive action to the /logs collection.
 */
export const logAction = async (
  user: { uid: string; email: string },
  action: string,
  resource: string,
  type: AuditLog['type'] = 'access',
  details?: string
) => {
  try {
    await addDoc(collection(db, "logs"), {
      userId: user.uid,
      userEmail: user.email,
      action,
      resource,
      type,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1" // In a real app, you'd get this from the request or a service
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};
