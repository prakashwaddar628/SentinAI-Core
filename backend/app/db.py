from sqlmodel import SQLModel, create_engine, Session

# This creates a file 'sentinai.db' in your backend folder
sqlite_file_name = "sentinai.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)

def init_db():
    """Creates the tables if they don't exist."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to provide a DB session to FastAPI."""
    with Session(engine) as session:
        yield session