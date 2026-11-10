import { useState }   from 'react';
import { Link }       from 'react-router-dom';
import { logout }     from '../api/auth';
import { message }    from '../api/client';
import { useSession } from '../api/session';

const Header = () => {
  const { user, ready }    = useSession();
  const [busy,  setBusy]   = useState(false);
  const [error, setError]  = useState('');

  const leave = async () => {
    setBusy(true);
    setError('');
    try     { await logout(); }
    catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  return (
    <header>
      <nav aria-label="메인 메뉴">
        <Link to="/" className="brand">YoungDocs</Link>
        {!ready ? <span>확인 중...</span> : user ? (
          <div className="nav-items">
            <span>{user.name}님</span>
            <button onClick={leave} disabled={busy}>{busy ? '로그아웃 중...' : '로그아웃'}</button>
          </div>
        ) : (
          <div className="nav-items"><Link to="/login">로그인</Link><Link to="/signup">회원가입</Link></div>
        )}
      </nav>
      {error && <p role="alert">{error}</p>}
    </header>
  );
};

export default Header;
