import { useCallback, useEffect, useRef, useState } from 'react';
import { recognize, type Fields, type Ocr }         from '../api/receipts';
import { message }                                  from '../api/client';

type Props = { id: string; auto?: boolean; onFields?: (fields: Fields) => void; onBusy?: (busy: boolean) => void };

const ReceiptOcr = ({ id, auto = false, onFields, onBusy }: Props) => {
  const [result, setResult] = useState<Ocr | null>(null);
  const [busy, setBusy]     = useState(auto);
  const [error, setError]   = useState('');
  const task               = useRef<AbortController | null>(null);
  const callbacks          = useRef({ onFields, onBusy });
  callbacks.current = { onFields, onBusy };

  const run = useCallback(async () => {
    if (task.current) return;
    const controller = new AbortController();
    task.current = controller;
    setBusy(true);
    setError('');
    setResult(null);
    callbacks.current.onBusy?.(true);

    try {
      const data = await recognize(id, controller.signal);
      if (controller.signal.aborted) return;
      setResult(data);
      if (!data.error) callbacks.current.onFields?.(data.fields);
    } catch (error) { if (!controller.signal.aborted) setError(message(error)); }
    finally {
      if (task.current === controller) task.current = null;
      if (!controller.signal.aborted) { setBusy(false); callbacks.current.onBusy?.(false); }
    }
  }, [id]);

  useEffect(() => {
    const timer = auto ? setTimeout(() => void run(), 0) : undefined;
    return () => { clearTimeout(timer); task.current?.abort(); };
  }, [auto, run]);

  return (
    <section className="receipt-ocr" aria-busy={busy}>
      <h2>영수증 분석</h2>
      <button type="button" onClick={() => void run()} disabled={busy}>{busy ? '분석 중...' : result ? '다시 분석' : '문자 인식'}</button>
      {busy && <p className="processing" role="status"><span className="spinner" aria-hidden="true" />영수증에서 날짜와 결제금액을 읽고 있습니다...</p>}
      {(error || result?.error) && <p role="alert">{error || result?.error} 직접 입력하거나 다시 분석해주세요.</p>}
      {result && !result.error && <div className="ocr-results"><article>
        <p>{result.fields.date ? `날짜: ${result.fields.date}` : '날짜를 확인하지 못했습니다.'} · {result.fields.amount !== null ? `금액: ${result.fields.amount.toLocaleString()}원` : '원화 결제금액을 확인하지 못했습니다.'}</p>
        <details><summary>인식한 원문 보기</summary><p><small>PaddleOCR · {(result.ms / 1000).toFixed(1)}초 · {result.lines.length}개 영역</small></p>{result.lines.length ? <pre>{result.text}</pre> : <p>인식된 문자가 없습니다.</p>}<details><summary>영역별 신뢰도·좌표</summary><ol>{result.lines.map((line, index) => <li key={index}><span>{line.text}</span> <strong>{(line.confidence * 100).toFixed(1)}%</strong><small>{line.box.map(point => `(${point.map(Math.round).join(', ')})`).join(' ')}</small></li>)}</ol><small>좌표 기준: {result.width} × {result.height}</small></details></details>
      </article></div>}
    </section>
  );
};

export default ReceiptOcr;
