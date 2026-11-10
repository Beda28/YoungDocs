import { useEffect, useState }       from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { get, type Entry }           from '../api/entries';
import { message }                   from '../api/client';
import { useSession }                from '../api/session';
import EntryForm                     from '../components/entry-form';

const Editor = ({ id }: { id: string }) => {
  const [entry, setEntry]     = useState<Entry | null>(null);
  const [error, setError]     = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) { setError('내역을 찾을 수 없습니다.'); return; }

    void get(Number(id), controller.signal).then(entry => {
      if (!controller.signal.aborted) setEntry(entry);
    }).catch(error => { if (!controller.signal.aborted) setError(message(error)); });

    return () => controller.abort();
  }, [id, version]);

  if (entry) return <EntryForm entry={entry} />;
  return <main><Link to="/">목록으로</Link>{error ? <p role="alert">{error} <button onClick={() => setVersion(value => value + 1)}>다시 불러오기</button></p> : <p role="status">내역을 불러오는 중...</p>}</main>;
};

const EditEntry = () => {
  const { id = '' }     = useParams();
  const { user, ready } = useSession();
  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  return user ? <Editor key={`${user.id}:${id}`} id={id} /> : <Navigate to="/login" replace />;
};

export default EditEntry;
