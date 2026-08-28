import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onLoginSuccess: (userProfile: UserProfile) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onLoginSuccess,
  onSwitchMode
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('Product Specialist');
  const [assignedRole, setAssignedRole] = useState<UserRole>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (mode === 'login') {
      const authResult = authService.authenticate(email, password);
      setIsLoading(false);
      if (authResult.success && authResult.user) {
        onLoginSuccess(authResult.user);
      } else {
        setErrorMsg(authResult.error || 'Authentication failed. Please verify your credentials.');
      }
    } else {
      // Organization registration
      if (!name.trim() || !company.trim() || !email.trim()) {
        setErrorMsg('Please complete all required fields.');
        setIsLoading(false);
        return;
      }
      
      const creationResult = authService.createAccount('admin', {
        name,
        email,
        roleTitle: roleTitle || 'Administrator',
        roleType: 'admin', // Root organization creator is Admin
        department: 'Executive Management',
        baseSalary: 250000
      });

      setIsLoading(false);
      if (creationResult.success && creationResult.account) {
        onLoginSuccess(creationResult.account.profile);
      } else {
        setErrorMsg(creationResult.error || 'Failed to initialize organization.');
      }
    }
  };

  return (
    <div id="auth-container" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0b1326]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl bg-gradient-to-b from-[#131b2e]/95 to-[#0f172a]/95">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7b42f6] to-[#a078ff] flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Sora']">
            {mode === 'login' ? 'Sign In to Aura HR' : 'Register Organization Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login' 
              ? 'Secure workforce access with permanent database role enforcement' 
              : 'Setup enterprise workforce management and administrator account'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">Administrator Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">Company / Organization Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                id="input-auth-email"
                placeholder="name@aurahrms.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 font-medium">Account Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your email.')}
                  className="text-purple-400 hover:text-purple-300 text-[11px] font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="input-auth-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-purple-500 rounded"
                />
                <span className="text-slate-400 text-xs">Keep session persistent</span>
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Database Authenticated
              </span>
            </div>
          )}

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={isLoading}
            className="brand-gradient-btn w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>
              {isLoading 
                ? 'Authenticating...' 
                : (mode === 'login' ? 'Sign In to Dashboard' : 'Register Organization & Admin Account')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-6 mt-6 border-t border-white/5 text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              New company or organization?{' '}
              <button
                onClick={() => onSwitchMode('signup')}
                className="text-purple-300 hover:text-purple-200 font-bold"
              >
                Setup Organization
              </button>
            </p>
          ) : (
            <p>
              Already registered with Aura HR?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-purple-300 hover:text-purple-200 font-bold"
              >
                Sign In to Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
