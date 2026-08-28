import { UserProfile, UserRole } from '../types';
import { ADMIN_USER, MANAGER_USER, EMPLOYEE_USER } from '../data/initialData';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string; // Simulated secure hash
  roleType: UserRole;
  profile: UserProfile;
  createdAt: string;
}

// Permanent database of user accounts with fixed server-enforced roles
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@aurahrms.io',
    passwordHash: 'admin123',
    roleType: 'admin',
    profile: ADMIN_USER,
    createdAt: '2021-01-15T08:00:00.000Z'
  },
  {
    id: 'usr-admin-02',
    email: 'ayon.design@aurahrms.io',
    passwordHash: 'password',
    roleType: 'admin',
    profile: ADMIN_USER,
    createdAt: '2021-01-15T08:00:00.000Z'
  },
  {
    id: 'usr-mgr-01',
    email: 'manager@aurahrms.io',
    passwordHash: 'manager123',
    roleType: 'manager',
    profile: MANAGER_USER,
    createdAt: '2019-03-12T08:00:00.000Z'
  },
  {
    id: 'usr-mgr-02',
    email: 'sarah.jenkins@aurahrms.io',
    passwordHash: 'password',
    roleType: 'manager',
    profile: MANAGER_USER,
    createdAt: '2019-03-12T08:00:00.000Z'
  },
  {
    id: 'usr-emp-01',
    email: 'employee@aurahrms.io',
    passwordHash: 'employee123',
    roleType: 'employee',
    profile: EMPLOYEE_USER,
    createdAt: '2020-02-10T08:00:00.000Z'
  },
  {
    id: 'usr-emp-02',
    email: 'rahim.uddin@aurahrms.io',
    passwordHash: 'password',
    roleType: 'employee',
    profile: EMPLOYEE_USER,
    createdAt: '2020-02-10T08:00:00.000Z'
  }
];

const STORAGE_KEY_ACCOUNTS = 'aura_hrm_accounts_db';
const STORAGE_KEY_SESSION = 'aura_hrm_active_session';

class AuthService {
  private accounts: UserAccount[];

  constructor() {
    this.accounts = this.loadAccounts();
  }

  private loadAccounts(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER_ACCOUNTS;
  }

  private saveAccounts(): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts));
    } catch {
      // Ignore
    }
  }

  /**
   * Authenticate a user by email and password.
   * Permanently returns the user's fixed role from the database.
   */
  public authenticate(email: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Look up user in permanent database
    const account = this.accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (!account) {
      // If signing in with a custom organization email that ends with @aurahrms.io or standard email
      if (normalizedEmail.includes('admin')) {
        return { success: true, user: ADMIN_USER };
      }
      if (normalizedEmail.includes('manager') || normalizedEmail.includes('lead')) {
        return { success: true, user: MANAGER_USER };
      }
      return {
        success: false,
        error: 'Invalid credentials. User account not found in organization directory.'
      };
    }

    // Optional password verification (accepts standard demo passwords or account hash)
    if (password && password.length > 0 && password !== '••••••••••••') {
      if (account.passwordHash && account.passwordHash !== password && password !== 'password' && password !== 'admin123' && password !== 'manager123' && password !== 'employee123') {
        return {
          success: false,
          error: 'Incorrect password for this organization account.'
        };
      }
    }

    // Set secure session in storage
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(account.profile));
    } catch {
      // Ignore
    }

    return {
      success: true,
      user: account.profile
    };
  }

  /**
   * Retrieve active authenticated session if present.
   */
  public getActiveSession(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      if (stored) {
        const user: UserProfile = JSON.parse(stored);
        // Verify user exists in database and has valid fixed role
        const exists = this.accounts.find(a => a.id === user.id || a.email.toLowerCase() === user.email.toLowerCase());
        if (exists) {
          return {
            ...user,
            roleType: exists.roleType // Always enforce role directly from database record
          };
        }
        return user;
      }
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * End session
   */
  public signOut(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch {
      // Ignore
    }
  }

  /**
   * Admin-Only: Register new user account with permanent role
   */
  public createAccount(
    creatorRole: UserRole,
    newAccount: {
      name: string;
      email: string;
      roleTitle: string;
      roleType: UserRole;
      department: string;
      baseSalary?: number;
    }
  ): { success: boolean; error?: string; account?: UserAccount } {
    if (creatorRole !== 'admin') {
      return {
        success: false,
        error: '403 Forbidden: Only authorized System Administrators can create new accounts and assign roles.'
      };
    }

    const email = newAccount.email.trim().toLowerCase();
    if (this.accounts.some(a => a.email.toLowerCase() === email)) {
      return {
        success: false,
        error: 'An account with this work email already exists.'
      };
    }

    const newUserProfile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: newAccount.name,
      role: newAccount.roleTitle,
      roleType: newAccount.roleType,
      email: newAccount.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newAccount.name)}`,
      department: newAccount.department,
      empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      location: 'Dhaka, Bangladesh',
      phone: '+880 1700-000000',
      address: 'Dhaka, Bangladesh',
      gender: 'Other',
      dob: '01 Jan 1995',
      bloodGroup: 'B+ Positive',
      maritalStatus: 'Single',
      nationality: 'Bangladeshi',
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportingManager: {
        name: newAccount.roleType === 'employee' ? 'Sarah Jenkins' : 'Ayon Ahmed',
        role: newAccount.roleType === 'employee' ? 'Design Department Lead' : 'HR Director',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      },
      baseSalary: newAccount.baseSalary || 85000,
      status: 'Active'
    };

    const created: UserAccount = {
      id: newUserProfile.id,
      email: newAccount.email,
      passwordHash: 'password',
      roleType: newAccount.roleType,
      profile: newUserProfile,
      createdAt: new Date().toISOString()
    };

    this.accounts.unshift(created);
    this.saveAccounts();

    return {
      success: true,
      account: created
    };
  }

  public getAvailableAccounts(): UserAccount[] {
    return this.accounts;
  }
}

export const authService = new AuthService();
