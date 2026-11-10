from easyocr    import Reader
from ocr.paddle import model

Reader(['ko', 'en'], gpu=False, model_storage_directory='/opt/models/easy', verbose=False)
model()
