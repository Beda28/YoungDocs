from threading       import BoundedSemaphore
from time            import perf_counter
from fastapi         import APIRouter, HTTPException, UploadFile
from preprocess.prep import load
from ocr.fields      import extract

import cv2
import logging

router = APIRouter()
slots  = BoundedSemaphore(1)
log    = logging.getLogger(__name__)

def run(name, img):
    start = perf_counter()
    try:
        if name == 'paddleocr':
            from ocr.paddle import read
        else:
            from ocr.easy import read
        lines = read(img)
        return {'lines': lines, 'text': '\n'.join(line['text'] for line in lines), 'ms': round((perf_counter() - start) * 1000), 'error': None}
    except Exception as error:
        log.error('%s failed: %s', name, type(error).__name__)
        return {'lines': [], 'text': '', 'ms': round((perf_counter() - start) * 1000), 'error': '문자 인식에 실패했습니다. 다시 시도해주세요.'}

@router.post('/ocr')
def recognize(file: UploadFile):
    if not slots.acquire(blocking=False):
        file.file.close()
        raise HTTPException(503, '다른 사진을 인식하고 있습니다. 잠시 후 다시 시도해주세요.')

    try:
        data = file.file.read(16 * 1024 * 1024 + 1)
        if len(data) > 16 * 1024 * 1024: raise HTTPException(413, '이미지가 너무 큽니다.')
        img = load(data)
        scale = min(1, 2400 / max(img.shape[:2]))
        if scale < 1: img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        result = run('paddleocr', img)
        return {'engine': 'paddleocr', 'width': img.shape[1], 'height': img.shape[0], **result, 'fields': extract(result['lines'])}
    except (ValueError, cv2.error) as error:
        raise HTTPException(422, '이미지를 읽을 수 없습니다.') from error
    finally:
        file.file.close()
        slots.release()
