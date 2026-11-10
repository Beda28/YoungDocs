import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useSession }                                from '../api/session';
import ReceiptImages                                 from '../components/receipt-images';
import ReceiptOcr                                     from '../components/receipt-ocr';

const Receipt = () => {
  const { id = '' }     = useParams();
  const { user, ready } = useSession();
  const [params]       = useSearchParams();
  const month          = params.get('month') ?? '';
  const back           = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month) ? `/?month=${month}` : '/';

  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main>
      <div className="ledger-heading"><h1>영수증</h1><Link to={back}>목록으로</Link></div>
      <ReceiptImages key={`${user.id}:${id}`} id={id} />
      <ReceiptOcr key={`${user.id}:${id}`} id={id} />
    </main>
  );
};

export default Receipt;
