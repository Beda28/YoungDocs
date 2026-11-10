from fastapi        import FastAPI
from router.health  import router as health
from router.receipt import router as receipt


app = FastAPI()

app.include_router(health)
app.include_router(receipt)
