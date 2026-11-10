import { useState, type SubmitEvent } from 'react';
import { Link, Navigate }             from 'react-router-dom';
import { login, signup }              from '../api/auth';
import { message }                    from '../api/client';
import { useSession }                 from '../api/session';

const AuthForm = ({ join = false }: { join?: boolean }) => {
  const { user, ready }    = useSession();
  const [busy, setBusy]    = useState(false);
  const [error, setError]  = useState('');
  const title             = join ? '회원가입' : '로그인';

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form     = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const name     = String(form.get('name') ?? '').trim();
    if (join && password !== form.get('confirm')) { setError('비밀번호가 일치하지 않습니다.'); return; }
    setBusy(true);
    setError('');
    try {
      if (join) await signup({ name, password });
      else      await login({ name, password });
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="auth">
      <h1>{title}</h1>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>아이디 / 닉네임<input name="name" autoComplete="username" maxLength={50} required /></label>
          <label>비밀번호<input name="password" type="password" autoComplete={join ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required /></label>
          {join && <label>비밀번호 확인<input name="confirm" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>}
          {join && <small>비밀번호는 8~128자로 입력해주세요.</small>}
          <button type="submit">{busy ? '처리 중...' : title}</button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
      <p>{join ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <Link to={join ? '/login' : '/signup'}>{join ? '로그인' : '회원가입'}</Link></p>
    </main>
  );
};

export default AuthForm;
