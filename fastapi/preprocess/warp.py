import cv2
import numpy as np

def warp(img, points):
    points = points.reshape(4, 2).astype(np.float32)

    center = points.mean(axis=0)
    angles = np.arctan2(
        points[:, 1] - center[1],
        points[:, 0] - center[0]
    )

    points = points[np.argsort(angles)]

    start  = np.argmin(points.sum(axis=1))
    points = np.roll(points, -start, axis=0)
    tl, tr, br, bl = points

    width  = max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl))
    height = max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr))
    width  = int(round(width))  + 1
    height = int(round(height)) + 1

    if width < 3 or height < 3: raise ValueError("Document is too small")

    scale  = min(1, 4000 / max(width, height), (8_000_000 / (width * height)) ** 0.5)
    width  = max(3, int(width * scale))
    height = max(3, int(height * scale))

    target = np.array([
        [0, 0],
        [width - 1, 0],
        [width - 1, height - 1],
        [0, height - 1]
    ], dtype=np.float32)

    matrix = cv2.getPerspectiveTransform(points, target)
    return cv2.warpPerspective(img, matrix, (width, height), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
def enhance(img):
    gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    scale = min(1, 1000 / max(gray.shape))
    small = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale < 1 else gray

    size  = max(15, round(min(small.shape) / 30)) | 1
    shape = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (size, size))

    light = cv2.morphologyEx(small, cv2.MORPH_CLOSE, shape)
    light = cv2.GaussianBlur(light, (0, 0), size / 3)
    light = cv2.resize(light, (gray.shape[1], gray.shape[0]), interpolation=cv2.INTER_LINEAR)

    return cv2.divide(gray, np.maximum(light, 1), scale=255)
