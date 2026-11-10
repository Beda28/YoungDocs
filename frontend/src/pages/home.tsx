import { useState }            from 'react';
import { health, type Health } from '../api/health';
import { useSession }          from '../api/session';

const Home = () => {
  const { user } = useSession();
  const [busy,   setBusy]   = useState(false);
  const [result, setResult] = useState<Health | null>(null);
  const [error,  setError]  = useState('');

  const check = async () => {
    setBusy(true);
    setResult(null);
    setError('');

    try     { setResult(await health()); }
    catch   { setError('서버에 연결할 수 없습니다.'); }
    finally { setBusy(false); }
  };

  return (
    <main>
      <h1>YoungDocs</h1>
      <p>{user ? `${user.name}님, 환영합니다.` : '로그인하고 시작하세요.'}</p>
      <button onClick={check} disabled={busy}>{busy ? 'Checking...' : 'Check'}</button>
      <div role="status">
        {result && <p>Nest: {result.status} / FastAPI: {result.fastapi ?? '연결 실패'}</p>}
        {error  && <p>{error}</p>}
      </div>
    </main>
  );
};

export default Home;
