import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/components/school/portal-page';
import { passwordError } from '@/lib/password';
import { lovable } from '@/integrations/lovable/index';
import { GoogleButton } from '@/components/school/google-button';

export const Route = createFileRoute('/set-password')({
  head: () => pageHead('Set Your Password', 'Choose your private password for your Aeren Global School account.'),
  component: SetPassword,
});

function SetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function verifyAccount() {
    const { data: verified, error: verificationError } = await supabase.auth.getUser();
    if (verificationError || !verified.user) throw new Error('Please verify your Google account to continue.');
    const { data: allowed, error: roleError } = await supabase.rpc('has_role', { _user_id: verified.user.id, _role: 'super_admin' });
    if (roleError || !allowed) throw new Error('This Google account is not an active school Super Admin. Choose your school administrator account.');
    return verified.user;
  }

  async function googleVerification() {
    setBusy(true);
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/set-password`,
        extraParams: { prompt: 'select_account' },
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      await verifyAccount();
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google verification could not be completed.');
    } finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    async function verifyInvitation() {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token_hash');
        const type = url.searchParams.get('type');
        const code = url.searchParams.get('code');
        if (token && (type === 'invite' || type === 'recovery')) {
          const result = await supabase.auth.verifyOtp({ token_hash: token, type });
          if (result.error) throw result.error;
        } else if (code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          if (result.error) throw result.error;
        }
        // getSession waits for the client's initial URL-token handling.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const hash = new URLSearchParams(url.hash.slice(1));
        if (hash.get('error_description')) throw new Error(hash.get('error_description') ?? 'Invitation unavailable.');
        if (!data.session) return;
        await verifyAccount();
        window.history.replaceState({}, '', '/set-password');
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to verify your invitation.');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    void verifyInvitation();
    return () => { cancelled = true; };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get('password') ?? '');
    const validation = passwordError(password, String(values.get('confirmation') ?? ''));
    if (validation) { setError(validation); return; }
    setError('');
    setBusy(true);
    try {
      await verifyAccount();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your password.');
    } finally { setBusy(false); }
  }

  return <div className="auth-form-area password-setup-page"><div className="auth-form">
    <span className="gold-icon"><LockKeyhole size={25}/></span>
    <div className="eyebrow">AEREN GLOBAL SCHOOL</div>
    <h1>Choose your password</h1>
    {checking ? <p role="status">Checking your account…</p> : ready ? <form onSubmit={save} className="form-grid">
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required/></label>
      <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required/></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
    </form> : <>{error && <p role="alert" className="form-error">{error}</p>}<GoogleButton disabled={busy} onClick={() => void googleVerification()}/></>}
    <Link to="/auth" className="back-link">Back to sign in</Link>
  </div></div>;
}