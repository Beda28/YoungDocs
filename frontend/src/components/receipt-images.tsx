import { useEffect, useState } from 'react';
import { original, read }      from '../api/receipts';
import { message }             from '../api/client';


const ReceiptImages = ({ id }: { id: string }) => {
  const [images, setImages]   = useState<{ original: string; result: string } | null>(null);
  const [error, setError]     = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const urls: string[] = [];
    setImages(null);
    setError('');

    void Promise.all([original(id, controller.signal), read(id, controller.signal)]).then(([source, result]) => {
      if (controller.signal.aborted) return;
      const images = { original: source ? URL.createObjectURL(source) : '', result: URL.createObjectURL(result) };
      urls.push(images.original, images.result);
      setImages(images);
    }).catch(error => { if (!controller.signal.aborted) setError(message(error)); });

    return () => { controller.abort(); urls.forEach(url => { if (url) URL.revokeObjectURL(url); }); };
  }, [id, version]);

  if (error) return <p role="alert">{error} <button type="button" onClick={() => setVersion(value => value + 1)}>다시 불러오기</button></p>;
  if (!images) return <p className="processing" role="status"><span className="spinner" aria-hidden="true" />사진을 불러오는 중...</p>;

  return (
    <div className="comparison">
      <figure><figcaption>원본</figcaption>{images.original ? <img src={images.original} alt="원본 영수증" /> : <p>저장된 원본이 없습니다.</p>}</figure>
      <figure><figcaption>보정본</figcaption><img src={images.result} alt="보정된 영수증" /></figure>
    </div>
  );
};

export default ReceiptImages;
