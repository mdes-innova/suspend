import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

HOST = os.environ.get('POSTGRES_HOST')
PORT = os.environ.get('POSTGRES_PORT')
DB = os.environ.get('POSTGRES_DB')
PASSWORD = os.environ.get('POSTGRES_PASSWORD')
USER = os.environ.get('POSTGRES_USER')


DATABASE_URL =\
    f'postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}'

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine,
                            class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()
