from typing import TypedDict, List, Optional, Literal, Any

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 500, frontend_message: str = "Internal Server Error"):
        super().__init__(message)
        self.status_code = status_code
        self.frontend_message = frontend_message

class IAppConfig(TypedDict):
    port: int
    server_url: str
    node_environment: str

class ICorsOptions(TypedDict):  # total=False makes all keys optional unless required
    origin: str
    credentials: bool
    methods: Optional[List[str]]    
    allowed_headers: Optional[List[str]]   

class IDatabaseConfig(TypedDict):
    host: str
    user: str
    password: str
    database: str
    port: int
    connection_timeout: int

class ICookieToken(TypedDict, total=False):
    httponly: bool
    secure: bool
    same_site: Literal["strict", "lax", "none", False] 
    max_age: Optional[int]   

class ITransactionQuery(TypedDict):
    query: str
    params: Optional[List[Any]]