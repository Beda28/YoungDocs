from io  import BytesIO
from PIL import Image, UnidentifiedImageError

import cv2
import numpy as np

def load(data):
    try:
        with Image.open(BytesIO(data)) as image:
            if image.format not in ('JPEG', 'PNG', 'WEBP'): raise ValueError('JPG, PNG, WebP 이미지만 사용할 수 있습니다.')
            if image.width * image.height > 24_000_000: raise ValueError('2400만 화소 이하의 이미지를 올려주세요.')
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError) as error:
        raise ValueError('이미지를 읽을 수 없습니다.') from error

    data = np.frombuffer(data, dtype=np.uint8)
    img  = cv2.imdecode(data, cv2.IMREAD_COLOR) if data.size else None
    if img is None: raise ValueError('이미지를 읽을 수 없습니다.')

    return img
def prep(img, blur=5, low=50, high=100):
    if blur < 1 or blur % 2 == 0: raise ValueError('blur must be a positive odd number')
    if not 0 <= low < high      : raise ValueError('Use 0 <= low < high')

    gray   = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    smooth = cv2.GaussianBlur(gray, (blur, blur), 0)
    edges  = cv2.Canny(smooth, low, high, L2gradient=True)

    return edges
