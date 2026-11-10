import { useState }            from 'react';
import { health, type Health } from '../api/health';

const Home = () => {
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
      <button onClick={check} disabled={busy}>{busy ? 'Checking...' : 'Check'}</button>
      <div role="status">
        {result && <p>Nest: {result.status} / FastAPI: {result.fastapi ?? '연결 실패'}</p>}
        {error  && <p>{error}</p>}
      </div>
    </main>
  );
};

export default Home;
