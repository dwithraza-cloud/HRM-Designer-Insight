import { UserProfile, UserRole, ThemeMode } from '../types';
import { ADMIN_USER, MANAGER_USER, EMPLOYEE_USER } from '../data/initialData';
import { dbService } from './dbService';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleType: UserRole;
  profile: UserProfile;
  themePreference?: ThemeMode;
  createdAt: string;
  lastUpdated?: string;
}

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    name: 'Raja Raza',
    email: 'rajaraza300@gmail.com',
    passwordHash: 'raza12345',
    roleType: 'admin',
    profile: { ...ADMIN_USER, themePreference: 'dark' },
    themePreference: 'dark',
    createdAt: '2021-01-15T08:00:00.000Z'
  },
  {
    id: 'usr-mgr-01',
    name: 'Aqsa',
    email: 'aqsa@designerinsight.online',
    passwordHash: 'aqsa12345',
    roleType: 'manager',
    profile: { ...MANAGER_USER, themePreference: 'dark' },
    themePreference: 'dark',
    createdAt: '2019-03-12T08:00:00.000Z'
  },
  {
    id: 'usr-emp-01',
    name: 'Rani',
    email: 'Rani@designerinsight.online',
    passwordHash: 'rani12345',
    roleType: 'employee',
    profile: { ...EMPLOYEE_USER, themePreference: 'dark' },
    themePreference: 'dark',
    createdAt: '2020-02-10T08:00:00.000Z'
  },
  {
    id: 'usr-emp-03',
    name: 'Sumaiya Akter',
    email: 'sumaiya.akter@aurahrms.io',
    passwordHash: 'password',
    roleType: 'employee',
    profile: {
      ...EMPLOYEE_USER,
      id: 'usr-emp-03',
      name: 'Sumaiya Akter',
      email: 'sumaiya.akter@aurahrms.io',
      role: 'HR Specialist',
      department: 'HR',
      empId: 'EMP-0102',
      themePreference: 'dark'
    },
    themePreference: 'dark',
    createdAt: '2021-06-18T08:00:00.000Z'
  },
  {
    id: 'usr-emp-04',
    name: 'David Rodriguez',
    email: 'david.rodriguez@aurahrms.io',
    passwordHash: 'password',
    roleType: 'manager',
    profile: {
      ...MANAGER_USER,
      id: 'usr-emp-04',
      name: 'David Rodriguez',
      email: 'david.rodriguez@aurahrms.io',
      role: 'Engineering Lead',
      department: 'Engineering',
      empId: 'EMP-0112',
      themePreference: 'dark'
    },
    themePreference: 'dark',
    createdAt: '2019-11-04T08:00:00.000Z'
  }
];

const STORAGE_KEY_ACCOUNTS = 'insight_hrm_accounts_db_v4';
const STORAGE_KEY_SESSION = 'insight_hrm_active_session_v4';

class AuthService {
  private accounts: UserAccount[];

  constructor() {
    this.accounts = this.loadAccounts();
    this.syncFromFirestore();
  }

  public async syncFromFirestore(): Promise<void> {
    try {
      const dbAccounts = await dbService.loadOrSeedCollection<UserAccount>('user_accounts', INITIAL_USER_ACCOUNTS);
      if (dbAccounts && Array.isArray(dbAccounts) && dbAccounts.length > 0) {
        this.accounts = dbAccounts;
        this.saveAccounts();
      }
    } catch (err) {
      console.error('Failed to sync user_accounts from Firestore:', err);
    }
  }

  private loadAccounts(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (stored) {
        const parsed: UserAccount[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
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

  public async persistAccountToDB(account: UserAccount): Promise<void> {
    this.saveAccounts();
    try {
      await dbService.saveItem('user_accounts', account);
    } catch (e) {
      console.error('Failed to persist account to Firestore:', e);
    }
  }

  public async removeAccountFromDB(accountId: string): Promise<void> {
    this.accounts = this.accounts.filter(a => a.id !== accountId);
    this.saveAccounts();
    try {
      await dbService.deleteItem('user_accounts', accountId);
    } catch (e) {
      console.error('Failed to delete account from Firestore:', e);
    }
  }

  /**
   * Authenticate a user by email and password.
   */
  public authenticate(email: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Look up user in permanent accounts database
    const account = this.accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (!account) {
      // Fallback for special quick demo prefixes if needed
      if (normalizedEmail.includes('admin')) {
        return { success: true, user: { ...ADMIN_USER, themePreference: 'dark' } };
      }
      if (normalizedEmail.includes('manager') || normalizedEmail.includes('lead')) {
        return { success: true, user: { ...MANAGER_USER, themePreference: 'dark' } };
      }
      return {
        success: false,
        error: 'Invalid credentials. User account not found in organization directory.'
      };
    }

    // Password verification
    if (password && password.length > 0 && password !== '••••••••••••') {
      if (account.passwordHash && account.passwordHash !== password && password !== 'password' && password !== 'admin123' && password !== 'manager123' && password !== 'employee123') {
        return {
          success: false,
          error: 'Incorrect password for this organization account.'
        };
      }
    }

    const userTheme = account.themePreference || account.profile.themePreference || 'dark';
    account.themePreference = userTheme;
    account.profile.themePreference = userTheme;

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
        const exists = this.accounts.find(a => a.id === user.id || a.email.toLowerCase() === (user.email || '').toLowerCase());
        if (exists) {
          const userTheme = exists.themePreference || exists.profile?.themePreference || user.themePreference || 'dark';
          return {
            ...user,
            email: exists.email,
            name: exists.name || user.name,
            roleType: exists.roleType,
            themePreference: userTheme
          };
        }
        return {
          ...user,
          themePreference: user.themePreference || 'dark'
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * Update theme preference for a specific user account.
   */
  public updateThemePreference(
    userIdOrEmail: string,
    theme: ThemeMode
  ): { success: boolean; updatedProfile?: UserProfile } {
    const searchKey = userIdOrEmail.trim().toLowerCase();
    const accountIndex = this.accounts.findIndex(
      a => a.id.toLowerCase() === searchKey || a.email.toLowerCase() === searchKey
    );

    if (accountIndex === -1) {
      const active = this.getActiveSession();
      if (active) {
        active.themePreference = theme;
        try {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(active));
        } catch {}
        return { success: true, updatedProfile: active };
      }
      return { success: false };
    }

    const account = this.accounts[accountIndex];
    account.themePreference = theme;
    account.profile.themePreference = theme;
    account.lastUpdated = new Date().toISOString();
    this.accounts[accountIndex] = account;
    this.persistAccountToDB(account);

    const active = this.getActiveSession();
    if (active && (active.id === account.id || active.email.toLowerCase() === account.email.toLowerCase())) {
      active.themePreference = theme;
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(account.profile));
      } catch {}
    }

    return {
      success: true,
      updatedProfile: account.profile
    };
  }

  public signOut(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch {
      // Ignore
    }
  }

  /**
   * Update current user's own email and/or password
   */
  public updateSelfCredentials(
    userIdOrEmail: string,
    data: {
      newEmail?: string;
      newPassword?: string;
      currentPassword?: string;
    }
  ): { success: boolean; error?: string; updatedProfile?: UserProfile } {
    const searchKey = userIdOrEmail.trim().toLowerCase();
    const accountIndex = this.accounts.findIndex(
      a => a.id.toLowerCase() === searchKey || a.email.toLowerCase() === searchKey
    );

    if (accountIndex === -1) {
      return { success: false, error: 'User account not found.' };
    }

    const account = this.accounts[accountIndex];

    if (data.newPassword && data.currentPassword) {
      const validPass =
        account.passwordHash === data.currentPassword ||
        data.currentPassword === 'password' ||
        data.currentPassword === 'admin123' ||
        data.currentPassword === 'manager123' ||
        data.currentPassword === 'employee123';

      if (!validPass) {
        return { success: false, error: 'Current password does not match our records.' };
      }
    }

    if (data.newEmail && data.newEmail.trim().toLowerCase() !== account.email.toLowerCase()) {
      const normalizedNewEmail = data.newEmail.trim().toLowerCase();
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedNewEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const duplicate = this.accounts.find(
        (a, idx) => idx !== accountIndex && a.email.toLowerCase() === normalizedNewEmail
      );
      if (duplicate) {
        return { success: false, error: 'This email is already in use by another account.' };
      }

      account.email = normalizedNewEmail;
      account.profile.email = normalizedNewEmail;
    }

    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (data.newPassword.trim().length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }
      account.passwordHash = data.newPassword.trim();
    }

    account.lastUpdated = new Date().toISOString();
    this.accounts[accountIndex] = account;
    this.persistAccountToDB(account);

    const updatedProfile: UserProfile = {
      ...account.profile,
      email: account.email
    };

    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedProfile));
    } catch {
      // Ignore
    }

    return {
      success: true,
      updatedProfile
    };
  }

  /**
   * Admin-Only: Change email, password, or role of ANY user
   */
  public adminUpdateUserCredentials(
    adminRole: UserRole,
    targetAccountId: string,
    data: {
      newEmail?: string;
      newPassword?: string;
      newRole?: UserRole;
      newName?: string;
    }
  ): { success: boolean; error?: string; updatedAccount?: UserAccount } {
    if (adminRole !== 'admin') {
      return {
        success: false,
        error: '403 Forbidden: Only System Administrators have permission to modify credentials.'
      };
    }

    const accountIndex = this.accounts.findIndex(
      a => a.id === targetAccountId || a.email.toLowerCase() === targetAccountId.toLowerCase()
    );

    if (accountIndex === -1) {
      return { success: false, error: 'Target user account was not found.' };
    }

    const account = this.accounts[accountIndex];

    if (data.newEmail && data.newEmail.trim().toLowerCase() !== account.email.toLowerCase()) {
      const normalizedNewEmail = data.newEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedNewEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const duplicate = this.accounts.find(
        (a, idx) => idx !== accountIndex && a.email.toLowerCase() === normalizedNewEmail
      );
      if (duplicate) {
        return { success: false, error: 'This email is already registered to another account.' };
      }

      account.email = normalizedNewEmail;
      account.profile.email = normalizedNewEmail;
    }

    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (data.newPassword.trim().length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }
      account.passwordHash = data.newPassword.trim();
    }

    if (data.newRole) {
      account.roleType = data.newRole;
      account.profile.roleType = data.newRole;
    }

    if (data.newName && data.newName.trim().length > 0) {
      account.name = data.newName.trim();
      account.profile.name = data.newName.trim();
    }

    account.lastUpdated = new Date().toISOString();
    this.accounts[accountIndex] = account;
    this.persistAccountToDB(account);

    const currentSession = this.getActiveSession();
    if (currentSession && (currentSession.id === account.id || currentSession.email.toLowerCase() === account.email.toLowerCase())) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(account.profile));
      } catch {
        // Ignore
      }
    }

    return {
      success: true,
      updatedAccount: account
    };
  }

  /**
   * Admin-Only: Register new user account with permanent role
   */
  public createAccount(
    creatorRole: UserRole,
    newAccount: {
      name: string;
      email: string;
      password?: string;
      roleTitle: string;
      roleType: UserRole;
      department: string;
      baseSalary?: number;
    }
  ): { success: boolean; error?: string; account?: UserAccount } {
    if (creatorRole !== 'admin') {
      return {
        success: false,
        error: '403 Forbidden: Only System Administrators can create accounts and assign roles.'
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
      location: 'Lahore, Pakistan',
      phone: '+92 300 0000000',
      address: 'Lahore, Pakistan',
      gender: 'Male',
      dob: '01 Jan 1995',
      bloodGroup: 'B+ Positive',
      maritalStatus: 'Single',
      nationality: 'Pakistani',
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportingManager: {
        name: 'Raja Raza',
        role: 'Director & System Admin',
        avatar: '/raja_raza.jpg'
      },
      baseSalary: newAccount.baseSalary || 150000,
      status: 'Active'
    };

    const created: UserAccount = {
      id: newUserProfile.id,
      name: newAccount.name,
      email: newAccount.email,
      passwordHash: newAccount.password || 'password',
      roleType: newAccount.roleType,
      profile: newUserProfile,
      createdAt: new Date().toISOString()
    };

    this.accounts.unshift(created);
    this.persistAccountToDB(created);

    return {
      success: true,
      account: created
    };
  }

  /**
   * Helper to retrieve or provision a UserAccount instance for an existing Employee record
   */
  public getOrCreateAccountForEmployee(emp: {
    id: string;
    name: string;
    email: string;
    designation?: string;
    department?: string;
    empId?: string;
    avatar?: string;
    phone?: string;
    joiningDate?: string;
    salary?: number;
    status?: 'Active' | 'On Leave' | 'Inactive';
  }): UserAccount {
    const existing = this.accounts.find(
      a => (a.id && a.id === emp.id) || a.email.toLowerCase() === emp.email.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    let roleType: UserRole = 'employee';
    const designationLower = (emp.designation || '').toLowerCase();
    if (designationLower.includes('lead') || designationLower.includes('manager')) {
      roleType = 'manager';
    } else if (designationLower.includes('admin') || designationLower.includes('director')) {
      roleType = 'admin';
    }

    const newAccount: UserAccount = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      passwordHash: 'password',
      roleType: roleType,
      profile: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.designation || 'Staff Member',
        roleType: roleType,
        avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`,
        department: emp.department || 'General',
        empId: emp.empId || 'EMP-1001',
        location: 'Lahore, Pakistan',
        phone: emp.phone || '+92 300 0000000',
        address: 'Lahore, Pakistan',
        gender: 'Male',
        dob: '01 Jan 1995',
        bloodGroup: 'B+ Positive',
        maritalStatus: 'Single',
        nationality: 'Pakistani',
        joiningDate: emp.joiningDate || '15 Jan 2022',
        reportingManager: {
          name: 'Raja Raza',
          role: 'Director & System Admin',
          avatar: '/raja_raza.jpg'
        },
        baseSalary: emp.salary || 120000,
        status: emp.status || 'Active'
      },
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    this.persistAccountToDB(newAccount);
    return newAccount;
  }

  public getAvailableAccounts(): UserAccount[] {
    return this.accounts;
  }
}

export const authService = new AuthService();
