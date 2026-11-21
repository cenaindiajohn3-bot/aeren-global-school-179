import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { GraduationCap, UserRound, BookOpen, ShieldCheck, ArrowRight, ArrowLeft, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { uidEmail } from '@/lib/school';
import study from '@/assets/school-study.jpg';
import { useQueryClient } from '@tanstack/react-query';
import { schoolWorkspace } from '@/lib/login-access';

const choices = [
  { role: 'student', label: 'Student', icon: GraduationCap },
  { role: 'teacher', label: 'Teacher', icon: BookOpen },
  { role: 'admin', label: 'Admin', icon: ShieldCheck },
] as const;

export function LoginPage({ initialRole = '' }: { initialRole?: string }) {
  const selected = choices.find(choice => choice.role === initialRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const values = new FormData(event.currentTarget);
    try {
      const uid = String(values.get('uid') ?? '').trim();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: uid.includes('@') ? uid : uidEmail(uid),
        password: String(values.get('password') ?? ''),
      });
      if (signInError) throw signInError;
      const { data: snapshot, error: accountError } = await supabase.rpc('portal_snapshot');
      if (accountError) {
        await supabase.auth.signOut();
        throw new Error('No active school account assigned. Contact your school administrator.');
      }
      const role = (snapshot as unknown as { role: string }).role;
      const destination = schoolWorkspace(role);
      queryClient.clear();
      await navigate({ to: destination });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally { setBusy(false); }
  }

  return <div className="school-login">
    <img className="login-background" src={study} alt="Open school exercise books" width={1536} height={1024}/>
    <header className="login-header"><Link to="/" className="login-brand"><GraduationCap size={32}/><span>AEREN <small>GLOBAL SCHOOL</small></span></Link><span className="login-header-label">Examination & Result Portal</span></header>
    <main className={`login-content ${selected ? 'login-content-form' : ''}`}>
      <div className="eyebrow">EXAMINATION & RESULT PORTAL</div>
      <h1>Aeren Global School</h1>
      {selected ? <>
        <Button asChild variant="link" className="login-back"><Link to="/"><ArrowLeft/> All login options</Link></Button>
        <div className="login-form-heading"><selected.icon size={25}/><h2>Login as {selected.label}</h2></div>
        {forgot ? <div className="password-help"><h3>Forgot your password?</h3><p>{selected.role === 'admin' ? 'Verify your administrator Google account to choose your password.' : 'Contact your school administrator to reset your school-issued password.'}</p>{selected.role === 'admin' && <Button asChild variant="outline"><Link to="/set-password">Create my password with Google</Link></Button>}<Button variant="outline" onClick={() => setForgot(false)}>Back to login</Button></div> : <form className="form-grid" onSubmit={submit}>
          <label>{selected.role === 'student' ? 'Student UID' : selected.role === 'teacher' ? 'Teacher username' : 'Admin email or username'}<input name="uid" autoComplete="username" placeholder={selected.role === 'student' ? 'Enter your student UID' : selected.role === 'teacher' ? 'Enter your teacher username' : 'Enter your admin email'} required/></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" minLength={8} required/></label>
          <Button type="button" variant="link" className="forgot-button" onClick={() => setForgot(true)}>Forgot password?</Button>
          {error && <p role="alert" className="form-error">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'Signing in…' : `Login as ${selected.label}`}<ArrowRight/></Button>
        </form>}
        {selected.role === 'admin' && !forgot && <Link to="/set-password" className="admin-password-link">Create my password with Google</Link>}
      </> : <><h2 className="login-welcome">School login</h2><div className="login-choices">{choices.map(({ role, label, icon: Icon }) => <Button key={role} asChild variant="outline" className="login-choice"><Link to="/auth" search={{ role }}><span className="login-choice-icon"><Icon size={28}/></span><span>Login as {label}</span><ArrowRight size={19}/></Link></Button>)}</div></>}
      <div className="login-security"><LockKeyhole size={15}/> School-issued accounts only</div>
    </main>
    <footer className="login-footer"><span>© {new Date().getFullYear()} Aeren Global School</span><span>Poonam Sagar Complex, Mira Road East</span></footer>
  </div>;
}