import { useState, type SubmitEvent }  from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { add }                         from '../api/entries';
import { message }                     from '../api/client';
import { useSession }                  from '../api/session';
import { today }                       from '../date';
import ReceiptUpload, { type Photo }   from '../components/receipt-upload';

const EntryForm = () => {
  const navigate         = useNavigate();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<Photo>({ id: null, busy: false, selected: false });

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || photo.busy || (photo.selected && !photo.id)) return;

    const data = new FormData(event.currentTarget);
    const date = String(data.get('date'));

    setBusy(true);
    setError('');

    try {
      await add({
        type:      data.get('type') === 'income' ? 'income' : 'expense',
        title:     String(data.get('title')).trim(),
        amount:    Number(data.get('amount')),
        date,
        ...(photo.id ? { receiptId: photo.id } : {}),
      });

      navigate(`/?month=${date.slice(0, 7)}`);
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  return (
    <main>
      <div className="ledger-heading"><h1>내역 추가</h1><Link to="/">목록으로</Link></div>
      <ReceiptUpload value={photo} onChange={setPhoto} disabled={busy} />
      <section className="entry-form">
        <h2>내역 입력</h2>
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <label>구분<select name="type" defaultValue="expense"><option value="expense">지출</option><option value="income">수입</option></select></label>
            <label>날짜<input name="date" type="date" defaultValue={today()} min="1000-01-01" max="9999-12-31" required /></label>
            <label className="entry-title">내용<input name="title" maxLength={100} placeholder="예: 점심 식사" required /></label>
            <label>금액 (원)<input name="amount" type="number" inputMode="numeric" min={1} max={2147483647} step={1} required /></label>
            <button type="submit" disabled={photo.busy || (photo.selected && !photo.id)}>{busy ? '저장 중...' : '저장'}</button>
          </fieldset>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
};
const NewEntry = () => {
  const { user, ready } = useSession();

  if (!ready) return <main><p role="status">로그인 확인 중...</p></main>;
  return user ? <EntryForm key={user.id} /> : <Navigate to="/login" replace />;
};

export default NewEntry;
