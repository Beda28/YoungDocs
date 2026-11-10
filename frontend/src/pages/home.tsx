import { Link }       from 'react-router-dom';
import { useSession } from '../api/session';
import Ledger         from './ledger';

const Home = () => {
  const { user, ready } = useSession();
  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  if (user) return <Ledger key={user.id} />;

  return (
    <main>
      <h1>내 가계부</h1>
      <p>수입과 지출을 기록하세요.</p>
      <Link to="/login">로그인</Link> · <Link to="/signup">회원가입</Link>
    </main>
  );
};

export default Home;
