import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { restore }             from './api/auth';
import { message }             from './api/client';
import Header                  from './components/header';
import Home                    from './pages/home';
import Login                   from './pages/login';
import Signup                  from './pages/signup';

const App = () => {
  const [error, setError] = useState('');
  useEffect(() => { void restore().catch(error => setError(message(error))); }, []);

  return (
    <>
      <Header />
      {error && <p role="alert">{error}</p>}
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*"       element={<main><h1>페이지를 찾을 수 없습니다.</h1><Link to="/">홈으로</Link></main>} />
      </Routes>
    </>
  );
};

export default App;
