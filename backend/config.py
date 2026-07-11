from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SelfStack"
    PROJECT_VERSION: str = "1.0.0"

    DATABASE_URL: str = "postgresql://selfstack_user:selfstack123@localhost/selfstack"

    SECRET_KEY: str = "selfstack-secret-key"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    GOOGLE_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()