from functools import lru_cache
from easyocr   import Reader

import torch

@lru_cache(maxsize=1)
def model():
    torch.set_num_threads(2)
    return Reader(['ko', 'en'], gpu=False, model_storage_directory='/opt/models/easy', download_enabled=False, verbose=False)

def read(img):
    return [{'text': text, 'confidence': float(score), 'box': [[float(x), float(y)] for x, y in box]} for box, text, score in model().readtext(img, workers=0, batch_size=1, paragraph=False)]
