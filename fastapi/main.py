from fastapi       import FastAPI
from router.health import router

app = FastAPI()
app.include_router(router)
