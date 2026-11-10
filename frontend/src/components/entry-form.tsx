import { useState, type SubmitEvent }          from 'react';
import { Link, useNavigate }                   from 'react-router-dom';
import { add, update, type Entry, type Draft } from '../api/entries';
import { message }                             from '../api/client';
import { today }                               from '../date';
import ReceiptUpload, { type Photo }           from './receipt-upload';

const EntryForm = ({ entry }: { entry?: Entry }) => {
  const navigate         = useNavigate();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<Photo>({ id: entry?.receiptId ?? null, busy: false, selected: !!entry?.receiptId });
  const back             = entry ? `/?month=${entry.date.slice(0, 7)}` : '/';

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || photo.busy || (photo.selected && !photo.id)) return;

    const data = new FormData(event.currentTarget);
    const date = String(data.get('date'));

    setBusy(true);
    setError('');

    try {
      const draft: Draft = {
        type:      data.get('type') === 'income' ? 'income' : 'expense',
        title:     String(data.get('title')).trim(),
        amount:    Number(data.get('amount')),
        date,
        receiptId: photo.id,
      };
      if (entry) await update(entry.id, draft);
      else       await add(draft);

      navigate(`/?month=${date.slice(0, 7)}`);
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  return (
    <main>
      <div className="ledger-heading"><h1>{entry ? '내역 수정' : '내역 추가'}</h1><Link to={back}>{entry ? '취소' : '목록으로'}</Link></div>
      <ReceiptUpload value={photo} onChange={setPhoto} disabled={busy} saved={entry?.receiptId} />
      <section className="entry-form">
        <h2>내역 입력</h2>
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <label>구분<select name="type" defaultValue={entry?.type ?? 'expense'}><option value="expense">지출</option><option value="income">수입</option></select></label>
            <label>날짜<input name="date" type="date" defaultValue={entry?.date ?? today()} min="1000-01-01" max="9999-12-31" required /></label>
            <label className="entry-title">내용<input name="title" defaultValue={entry?.title ?? ''} maxLength={100} placeholder="예: 점심 식사" required /></label>
            <label>금액 (원)<input name="amount" defaultValue={entry?.amount ?? ''} type="number" inputMode="numeric" min={1} max={2147483647} step={1} required /></label>
            <button type="submit" disabled={photo.busy || (photo.selected && !photo.id)}>{busy ? '저장 중...' : entry ? '수정 저장' : '저장'}</button>
          </fieldset>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
};

export default EntryForm;
