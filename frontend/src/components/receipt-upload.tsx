import { useEffect, useRef, useState } from 'react';
import { process, read, type Fields }  from '../api/receipts';
import { message }                     from '../api/client';
import ReceiptImages                   from './receipt-images';
import ReceiptOcr                      from './receipt-ocr';


export type Photo = { id: string | null; busy: boolean; selected: boolean };
type Props = { value: Photo; onChange: (value: Photo) => void; onFields: (fields: Fields) => void; disabled: boolean; saved?: string | null };

const ReceiptUpload = ({ value, onChange, onFields, disabled, saved }: Props) => {
  const [original, setOriginal] = useState('');
  const [result,   setResult]   = useState('');
  const [error,    setError]    = useState('');

  const file = useRef<File | null>(null);
  const task = useRef<AbortController | null>(null);


  useEffect(() => () => { task.current?.abort(); }, []);
  useEffect(() => () => { if (original) URL.revokeObjectURL(original); }, [original]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result); }, [result]);

  const select = async (image?: File) => {
    if (!image) return;

    task.current?.abort();
    const controller = new AbortController();
    task.current = controller;
    file.current = image;

    setOriginal('');
    setResult('');
    setError('');
    onFields({ date: null, amount: null });
    onChange({ id: null, busy: true, selected: true });

    let id: string | null = null;

    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) throw new Error('JPG, PNG, WebP 이미지만 사용할 수 있습니다.');
      if (image.size > 10 * 1024 * 1024) throw new Error('10MB 이하의 이미지를 올려주세요.');

      setOriginal(URL.createObjectURL(image));

      const key  = await process(image, controller.signal);
      const blob = await read(key, controller.signal);

      if (!controller.signal.aborted) { id = key; setResult(URL.createObjectURL(blob)); }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error && !('isAxiosError' in error) ? error.message : message(error));
    } finally {
      if (!controller.signal.aborted) onChange({ id, busy: !!id, selected: true });
    }
  };

  const clear = () => {
    task.current?.abort();
    file.current = null;

    setOriginal('');
    setResult('');
    setError('');
    onFields({ date: null, amount: null });
    onChange({ id: null, busy: false, selected: false });
  };

  return (
    <section className="receipt-upload" aria-busy={value.busy}>
      <h2>영수증 사진 <small>(선택)</small></h2>
      <p>사진을 올리면 보정한 뒤 날짜와 결제금액을 자동으로 읽습니다.</p>
      <div className="photo-actions">
        <label className="file-button">사진 선택<input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || value.busy} onChange={event => { void select(event.target.files?.[0]); event.target.value = ''; }} /></label>
        <label className="file-button">사진 촬영<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={disabled || value.busy} onChange={event => { void select(event.target.files?.[0]); event.target.value = ''; }} /></label>
        {value.selected && <button type="button" className="delete" onClick={clear} disabled={disabled || value.busy}>{value.id ? '사진 연결 해제' : '사진 제거'}</button>}
      </div>
      <p><small>JPG · PNG · WebP, 최대 10MB</small></p>
      {value.busy && !value.id && <p className="processing" role="status"><span className="spinner" aria-hidden="true" />사진을 처리하고 있습니다...</p>}
      {error && <p role="alert">{error} <button type="button" onClick={() => void select(file.current ?? undefined)} disabled={disabled || value.busy}>다시 처리</button></p>}
      {saved && value.id === saved && !original && <details><summary>저장된 사진 보기</summary><ReceiptImages id={saved} /></details>}
      {original && (
        <div className="comparison">
          <figure><figcaption>처리 전</figcaption><img src={original} alt="원본 영수증" /></figure>
          <figure><figcaption>처리 후</figcaption>{result ? <img src={result} alt="보정된 영수증" /> : <p>{value.busy ? '처리 중...' : '처리 결과가 없습니다.'}</p>}</figure>
        </div>
      )}
      {value.id && <ReceiptOcr key={value.id} id={value.id} auto={!!original} onFields={onFields} onBusy={busy => onChange({ ...value, busy })} />}
    </section>
  );
};

export default ReceiptUpload;
