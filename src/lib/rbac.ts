export type Permission =
  | 'view_patient'
  | 'create_patient'
  | 'edit_patient'
  | 'view_prescription'
  | 'create_prescription'
  | 'dispense_medication'
  | 'upload_lab_result'
  | 'view_radiology'
  | 'access_admin_dashboard'
  | 'view_reports'
  | 'manage_users'
  | 'manage_facilities'
  | 'upload_lab_request';

export type Role =
  | 'patient'
  | 'doctor'
  | 'pharmacist'
  | 'lab_technician'
  | 'facility_admin'
  | 'ministry_admin'
  | 'admin'
  | 'regional_admin';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  patient: ['view_patient'],
  doctor: ['view_patient', 'create_prescription', 'upload_lab_request'],
  pharmacist: ['view_prescription', 'dispense_medication'],
  lab_technician: ['upload_lab_result', 'view_patient'],
  facility_admin: ['manage_users', 'manage_facilities', 'view_reports'],
  ministry_admin: ['access_admin_dashboard', 'view_reports', 'view_patient'],
  admin: [
    'view_patient',
    'create_patient',
    'edit_patient',
    'view_prescription',
    'create_prescription',
    'dispense_medication',
    'upload_lab_result',
    'view_radiology',
    'access_admin_dashboard',
    'view_reports',
    'manage_users',
    'manage_facilities',
    'upload_lab_request',
  ],
  regional_admin: ['view_reports', 'manage_facilities', 'access_admin_dashboard'],
};

export interface User {
  uid: string;
  email: string;
  role: Role;
  permissions: Permission[];
  facilityId?: string;
  yhid?: string;
  name?: string;
}

/**
 * Checks if a user has a specific permission.
 * It checks both the user's explicit permissions array and the default permissions for their role.
 */
export const checkPermission = (user: User | null, action: Permission): boolean => {
  if (!user) return false;

  // If user has explicit permissions, check them
  if (user.permissions && user.permissions.includes(action)) {
    return true;
  }

  // Check default permissions for the role
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  if (rolePermissions.includes(action)) {
    return true;
  }

  return false;
};

/**
 * Policy engine for data access rules.
 * This is used in the frontend to determine if a user can access a specific data object.
 */
export const canAccessData = (user: User | null, data: any, dataType: 'patient' | 'prescription' | 'report'): boolean => {
  if (!user) return false;

  // Ministry Admin can access all data (read-only)
  if (user.role === 'ministry_admin') return true;
  if (user.role === 'admin') return true;

  switch (dataType) {
    case 'patient':
      // Patient can only access own data (YHID match)
      if (user.role === 'patient') {
        return user.yhid === data.healthId || user.yhid === data.nationalId;
      }
      // Doctor can only access assigned patients (this is a simplified check, 
      // in a real app you'd check a relationship collection)
      if (user.role === 'doctor') {
        return true; // Simplified for this demo
      }
      // Facility admin can only access its patients
      if (user.role === 'facility_admin') {
        return user.facilityId === data.facilityId;
      }
      break;

    case 'prescription':
      if (user.role === 'patient') {
        return user.yhid === data.patientId;
      }
      if (user.role === 'pharmacist') {
        return true; // Pharmacists can view prescriptions to dispense them
      }
      break;

    case 'report':
      if (user.role === 'facility_admin') {
        return user.facilityId === data.facilityId;
      }
      break;
  }

  return false;
};
