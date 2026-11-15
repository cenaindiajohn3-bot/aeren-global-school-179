import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/components/school/portal-page';
import { passwordError } from '@/lib/password';

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
        if (!data.session) throw new Error('Open the invitation from your email to choose your password.');
        const { data: verified, error: verificationError } = await supabase.auth.getUser();
        if (verificationError || !verified.user) throw new Error('Your invitation has expired. Please request a new invitation.');
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
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your password.');
    } finally { setBusy(false); }
  }

  return <div className="auth-form-area"><div className="auth-form">
    <span className="gold-icon"><LockKeyhole size={25}/></span>
    <div className="eyebrow">AEREN GLOBAL SCHOOL</div>
    <h1>Choose your password</h1>
    {checking ? <p role="status">Verifying your invitation…</p> : ready ? <form onSubmit={save} className="form-grid">
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required/></label>
      <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required/></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
    </form> : <><p role="alert" className="form-error">{error}</p><Link to="/auth" className="back-link">Back to sign in</Link></>}
  </div></div>;
}