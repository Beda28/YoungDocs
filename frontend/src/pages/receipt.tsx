import { useEffect, useState }       from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { read }                      from '../api/receipts';
import { message }                   from '../api/client';
import { useSession }                from '../api/session';

const Receipt = () => {
  const { id }            = useParams();
  const { user, ready }   = useSession();
  const [url,   setUrl]   = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    if (!user || !id) return;

    const controller = new AbortController();
    let image = '';

    setUrl('');
    setError('');

    void read(id, controller.signal).then(blob => {
      if (!controller.signal.aborted) { image = URL.createObjectURL(blob); setUrl(image); }
    }).catch(error => { if (!controller.signal.aborted) setError(message(error)); });

    return () => { controller.abort(); if (image) URL.revokeObjectURL(image); };
  }, [user?.id, id]);


  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  if (!user) return <Navigate to="/login" replace />;


  return (
    <main>
      <div className="ledger-heading"><h1>영수증</h1><Link to="/">목록으로</Link></div>
      {error ? <p role="alert">{error}</p> : url ? <img className="receipt-result" src={url} alt="보정된 영수증" /> : <p className="processing" role="status"><span className="spinner" aria-hidden="true" />사진을 불러오는 중...</p>}
    </main>
  );
};

export default Receipt;
