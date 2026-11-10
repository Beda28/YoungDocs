from fastapi        import FastAPI
from router.health  import router as health
from router.receipt import router as receipt
from router.ocr     import router as ocr


app = FastAPI()

app.include_router(health)
app.include_router(receipt)
app.include_router(ocr)
