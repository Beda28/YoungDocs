from threading  import BoundedSemaphore
from fastapi    import APIRouter, HTTPException, UploadFile
from src.prep   import load, prep
from src.detect import find
from src.warp   import warp, enhance
from src.save   import save

import cv2


router = APIRouter()
slots  = BoundedSemaphore(2)
limit  = 10 * 1024 * 1024

@router.post('/process')
def process(file: UploadFile):
    if not slots.acquire(blocking=False):
        file.file.close()
        raise HTTPException(503, '이미지 처리 중입니다. 잠시 후 다시 시도해주세요.')

    try:
        data = file.file.read(limit + 1)
        if len(data) > limit: raise HTTPException(413, '10MB 이하의 이미지를 올려주세요.')

        img    = load(data)
        scale  = min(1, 2000 / max(img.shape[:2]))
        view   = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale < 1 else img

        edges  = prep(view)
        points = find(edges)
        if points is None: raise HTTPException(422, '영수증 테두리를 찾지 못했습니다. 배경과 구분되게 다시 촬영해주세요.')

        points = points.astype('float32')
        points[:, :, 0] *= img.shape[1] / view.shape[1]
        points[:, :, 1] *= img.shape[0] / view.shape[0]

        flat = warp(img, points)
        scan = enhance(flat)

        return {'result': save(scan)}

    except ValueError as error: raise HTTPException(422, str(error)) from error
    except cv2.error  as error: raise HTTPException(422, '이미지를 처리할 수 없습니다. 다른 사진을 올려주세요.') from error
    
    finally:
        file.file.close()
        slots.release()
