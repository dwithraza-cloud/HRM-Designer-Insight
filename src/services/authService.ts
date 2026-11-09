import { auth } from '../lib/firebase';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
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

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [];

const STORAGE_KEY_ACCOUNTS = 'insight_hrm_accounts_db_v4';
const STORAGE_KEY_SESSION = 'insight_hrm_active_session_v4';

class AuthService {
  private accounts: UserAccount[];

  public ready: Promise<void>;
  constructor() {
    this.accounts = [];
    this.ready = this.restore();
  }
  private async restore(): Promise<void> {
    await auth.authStateReady();
    if (auth.currentUser) await this.syncFromFirestore();
  }
  private async accountRequest(body: Record<string, unknown>): Promise<any> {
    if (!auth.currentUser) throw new Error('Please sign in first.');
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/accounts', {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Account operation failed.');
    return result;
  }
  public async syncFromFirestore(): Promise<void> {
    if (!auth.currentUser) { this.accounts = []; return; }
    this.accounts = await dbService.loadOrSeedCollection<UserAccount>('user_accounts', []);
    this.saveAccounts();
  }
  private saveAccounts(): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts.map(a => ({...a, passwordHash: ''}))));
    } catch {
      // Ignore
    }
  }

  public async persistAccountToDB(account: UserAccount): Promise<void> {
    const result = await this.accountRequest({action:'save',account});
    const index = this.accounts.findIndex(a=>a.id===account.id);
    if(index>=0) this.accounts[index]=result.account; else this.accounts.push(result.account);
    this.saveAccounts();
  }
  public async removeAccountFromDB(accountId: string): Promise<void> {
    await this.accountRequest({action:'delete',id:accountId});
    this.accounts = this.accounts.filter(a=>a.id!==accountId);
    this.saveAccounts();
  }
  /**
   * Authenticate a user by email and password.
   */
  public async authenticate(email: string, password?: string): Promise<{success:boolean;user?:UserProfile;error?:string}> {
    try {
      const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const result=await response.json();
      if(!response.ok||!result.success)return {success:false,error:result.error||'Sign-in failed.'};
      await signInWithCustomToken(auth,result.token);
      await this.syncFromFirestore();
      const account=this.accounts.find(a=>a.id===auth.currentUser?.uid);
      if(!account){await firebaseSignOut(auth);return {success:false,error:'Your organization profile is unavailable.'};}
      localStorage.setItem(STORAGE_KEY_SESSION,JSON.stringify(account.profile));
      return {success:true,user:account.profile};
    } catch { return {success:false,error:'Unable to sign in. Please try again.'}; }
  }
  /**
   * Retrieve active authenticated session if present.
   */
  public getActiveSession(): UserProfile | null {
    if(!auth.currentUser)return null;
    return this.accounts.find(a=>a.id===auth.currentUser?.uid)?.profile || null;
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
    void this.accountRequest({action:'theme',theme}).catch(()=>{});

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
    this.accounts=[];
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
    void firebaseSignOut(auth);
  }
  /**
   * Update current user's own email and/or password
   */
  public async updateSelfCredentials(userIdOrEmail:string,data:{newEmail?:string;newPassword?:string;currentPassword?:string}):Promise<{success:boolean;error?:string;updatedProfile?:UserProfile}> {
    try {
      const old=this.accounts.find(a=>a.id===auth.currentUser?.uid);
      const result=await this.accountRequest({action:'self',...data});
      if(data.newPassword) {
        const login=await this.authenticate(result.account.email,data.newPassword);
        if(!login.success)return {success:false,error:login.error};
      } else await this.syncFromFirestore();
      return {success:true,updatedProfile:result.updatedProfile};
    } catch(error:any){return {success:false,error:error.message};}
  }
  /**
   * Admin-Only: Change email, password, or role of ANY user
   */
  public async adminUpdateUserCredentials(
    adminRole: UserRole,
    targetAccountId: string,
    data: {
      newEmail?: string;
      newPassword?: string;
      newRole?: UserRole;
      newName?: string;
    }
  ): Promise<{ success: boolean; error?: string; updatedAccount?: UserAccount }> {
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
      if (data.newPassword.trim().length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
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
    try { await this.persistAccountToDB(account); } catch(error:any) { await this.syncFromFirestore(); return {success:false,error:error.message}; }

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
  public async createAccount(
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
  ): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
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
      passwordHash: newAccount.password || crypto.randomUUID()+'Aa1!',
      roleType: newAccount.roleType,
      profile: newUserProfile,
      createdAt: new Date().toISOString()
    };

    this.accounts.unshift(created);
    try { await this.persistAccountToDB(created); } catch(error:any) { await this.syncFromFirestore(); return {success:false,error:error.message}; }

    return {
      success: true,
      account: created
    };
  }

  /**
   * Helper to retrieve or provision a UserAccount instance for an existing Employee record
   */
  public async getOrCreateAccountForEmployee(emp: {
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
  }): Promise<UserAccount> {
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
      passwordHash: crypto.randomUUID()+'Aa1!',
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
    await this.persistAccountToDB(newAccount);
    return newAccount;
  }

  public getAvailableAccounts(): UserAccount[] {
    return this.accounts;
  }
}

export const authService = new AuthService();
