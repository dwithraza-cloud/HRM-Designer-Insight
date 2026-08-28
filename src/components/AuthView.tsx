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
  CheckCircle2 
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onLoginSuccess: (email: string, role: UserRole) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onLoginSuccess,
  onSwitchMode
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('ayon.design@aurahrms.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Ayon Ahmed');
  const [company, setCompany] = useState('Aura Technologies Ltd.');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email, selectedRole);
  };

  return (
    <div id="auth-container" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0b1326]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl bg-gradient-to-b from-[#131b2e]/95 to-[#0f172a]/95">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7b42f6] to-[#a078ff] flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Sora']">
            {mode === 'login' ? 'Sign in to Aura HR' : 'Create Organization Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login' ? 'Manage People, Power Growth with Smart HRMS' : 'Get started with enterprise workforce management'}
          </p>
        </div>

        {/* Role Selector Tabs (Only on Login) */}
        {mode === 'login' && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-6">
            {[
              { id: 'admin' as UserRole, label: 'Admin' },
              { id: 'manager' as UserRole, label: 'Manager' },
              { id: 'employee' as UserRole, label: 'Employee' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRole(r.id);
                  if (r.id === 'admin') setEmail('ayon.design@aurahrms.io');
                  else if (r.id === 'manager') setEmail('sarah.jenkins@aurahrms.io');
                  else setEmail('rahim.uddin@aurahrms.io');
                }}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedRole === r.id
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayon Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">Company Name</label>
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
                placeholder="name@aurahrms.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 font-medium">Password</label>
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
                <span className="text-slate-400 text-xs">Keep me logged in</span>
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
            </div>
          )}

          <button
            type="submit"
            id="btn-auth-submit"
            className="brand-gradient-btn w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer mt-2"
          >
            <span>{mode === 'login' ? 'Login to Dashboard' : 'Create Organization Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-6 mt-6 border-t border-white/5 text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an organization setup yet?{' '}
              <button
                onClick={() => onSwitchMode('signup')}
                className="text-purple-300 hover:text-purple-200 font-bold"
              >
                Register Free
              </button>
            </p>
          ) : (
            <p>
              Already registered with Aura HR?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-purple-300 hover:text-purple-200 font-bold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
