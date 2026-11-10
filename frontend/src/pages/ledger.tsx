import { useEffect, useState, type SubmitEvent } from 'react';
import { add, list, remove, type Entry }         from '../api/entries';
import { message }                               from '../api/client';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

const Ledger = () => {
  const [month,   setMonth]   = useState(() => today().slice(0, 7));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [notice,  setNotice]  = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setEntries([]);
    void list(month, controller.signal).then(items => {
      if (!controller.signal.aborted) setEntries(items);
    }).catch(error => {
      if (!controller.signal.aborted) setError(message(error));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [month, version]);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const date = String(data.get('date'));
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await add({
        type:   data.get('type') === 'income' ? 'income' : 'expense',
        title:  String(data.get('title')).trim(),
        amount: Number(data.get('amount')),
        date,
      });
      form.reset();
      setMonth(date.slice(0, 7));
      setVersion(value => value + 1);
      setNotice('저장했습니다.');
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  const drop = async (id: number) => {
    if (!window.confirm('이 내역을 삭제할까요?')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await remove(id);
      setEntries(items => items.filter(item => item.id !== id));
      setNotice('삭제했습니다.');
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  };

  const income  = entries.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = entries.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  return (
    <main>
      <div className="ledger-heading">
        <h1>내 가계부</h1>
        <label>조회 월<input type="month" value={month} min="1000-01" max="9999-12" disabled={busy} onChange={event => { if (event.target.value) { setMonth(event.target.value); setNotice(''); } }} /></label>
      </div>
      {!loading && !error && (
        <dl className="summary">
          <div><dt>수입</dt><dd className="income">{won(income)}</dd></div>
          <div><dt>지출</dt><dd className="expense">{won(expense)}</dd></div>
          <div><dt>수입 - 지출</dt><dd>{won(income - expense)}</dd></div>
        </dl>
      )}
      <section className="entry-form">
        <h2>내역 입력</h2>
        <form onSubmit={submit}>
          <fieldset disabled={busy || loading}>
            <label>구분<select name="type" defaultValue="expense"><option value="expense">지출</option><option value="income">수입</option></select></label>
            <label>날짜<input name="date" type="date" defaultValue={today()} min="1000-01-01" max="9999-12-31" required /></label>
            <label className="entry-title">내용<input name="title" maxLength={100} placeholder="예: 점심 식사" required /></label>
            <label>금액 (원)<input name="amount" type="number" inputMode="numeric" min={1} max={2147483647} step={1} required /></label>
            <button type="submit">{busy ? '처리 중...' : '저장'}</button>
          </fieldset>
        </form>
      </section>
      <p role="status">{notice}</p>
      {error && <p role="alert">{error} <button onClick={() => setVersion(value => value + 1)} disabled={busy}>다시 불러오기</button></p>}
      <section aria-label="거래 내역">
        <h2>내역</h2>
        {loading ? <p role="status">불러오는 중...</p> : !entries.length ? <p>{error ? '내역을 확인할 수 없습니다.' : '이번 달 내역이 없습니다.'}</p> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>날짜</th><th>구분</th><th>내용</th><th className="amount">금액</th><th>관리</th></tr></thead>
              <tbody>{entries.map(item => (
                <tr key={item.id}>
                  <td>{item.date}</td><td>{item.type === 'income' ? '수입' : '지출'}</td><td className="title">{item.title}</td>
                  <td className={`amount ${item.type}`}>{item.type === 'expense' ? '-' : '+'}{won(item.amount)}</td>
                  <td><button className="delete" aria-label={`${item.title} 삭제`} onClick={() => drop(item.id)} disabled={busy || loading}>삭제</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Ledger;
