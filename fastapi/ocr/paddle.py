from functools import lru_cache
from paddleocr import PaddleOCR

@lru_cache(maxsize=1)
def model():
    return PaddleOCR(
        device='cpu',
        text_detection_model_name='PP-OCRv5_mobile_det',
        text_recognition_model_name='korean_PP-OCRv5_mobile_rec',
        use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False,
        enable_mkldnn=False, cpu_threads=2,
    )

def read(img):
    lines = []
    for result in model().predict(img):
        for text, score, box in zip(result['rec_texts'], result['rec_scores'], result['rec_polys']):
            lines.append({'text': text, 'confidence': float(score), 'box': box.astype(float).tolist()})
    return lines
