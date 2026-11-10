import { Navigate }   from 'react-router-dom';
import { useSession } from '../api/session';
import EntryForm      from '../components/entry-form';

const NewEntry = () => {
  const { user, ready } = useSession();
  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  return user ? <EntryForm key={user.id} /> : <Navigate to="/login" replace />;
};

export default NewEntry;
