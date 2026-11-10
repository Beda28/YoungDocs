from base64 import b64encode

import cv2

def save(scan):
    ok, data = cv2.imencode('.png', scan)
    if not ok: raise ValueError('결과 이미지를 만들 수 없습니다.')

    return b64encode(data.tobytes()).decode('ascii')
