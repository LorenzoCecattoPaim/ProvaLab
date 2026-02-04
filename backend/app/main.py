from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, exercises

# Criar tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma de Exercícios Educacionais",
    description="API para gerenciamento de exercícios de matemática",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rotas
app.include_router(auth.router)
app.include_router(exercises.router)

@app.get("/")
def root():
    return {"message": "API de Exercícios Educacionais", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
