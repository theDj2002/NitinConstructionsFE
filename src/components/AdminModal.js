import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Shield, AlertCircle } from 'lucide-react';

// ─── Email guard (obfuscated) ─────────────────────────────────────────────────
// The actual email is never stored as a string here.
// Instead we store a djb2 hash of it. The hash cannot be reversed to recover
// the original email, so inspecting the JS bundle reveals nothing useful.
function _h(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16);
}
// Hash of "nitin-constructions@gmail.com"  (generated at build-time, never changes)
const _ALLOWED = '82197ffd';
const _ok = (v) => _h(v.trim().toLowerCase()) === _ALLOWED;
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminModal({ open, onOpenChange }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');  // red inline under email field
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  // Validate email live as the user types / blurs
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !_ok(val)) {
      setEmailError('Email address does not match.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Hard-block if email doesn't match — never reaches the network
    if (!_ok(email)) {
      setEmailError('Email address does not match.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      onOpenChange(false);
      setEmail('');
      setPassword('');
      setEmailError('');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="admin-modal">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <DialogTitle className="text-center font-heading text-xl">Admin Login</DialogTitle>
            <DialogDescription className="text-center">
              Enter your credentials to access the dashboard
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
                <div data-testid="admin-login-error" className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
            )}

            {/* ── Email field ── */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                  data-testid="admin-email-input"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={emailError ? 'border-destructive focus-visible:ring-destructive/30' : ''}
              />
              {emailError && (
                  <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {emailError}
                  </p>
              )}
            </div>

            {/* ── Password field ── */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <Input
                  data-testid="admin-password-input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>

            <button
                data-testid="admin-login-submit"
                type="submit"
                disabled={submitting || !!emailError}
                className="w-full py-2.5 bg-gradient-gold text-white font-semibold rounded-lg gold-glow transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
  );
}