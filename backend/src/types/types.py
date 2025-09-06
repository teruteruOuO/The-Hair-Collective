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
    samesite: Literal["Strict", "Lax", "None"]  # Flask wants capitalized strings
    max_age: Optional[int] 

class ITransactionQuery(TypedDict):
    query: str
    params: Optional[List[Any]]

class IDecodedTokenPayload(TypedDict):
    id: int
    email: str
    iat: int
    exp: int

# S3 Types
class IBucket(TypedDict):
    access_key: str
    secret_access_key: str
    aws_region: str
    s3_bucket: str

class IBookLocations(TypedDict):
    slideshow: str
    featured: str
    stylist: str


# Variable types
ImageType = Literal["featured", "stylist", "slideshow"]
PageName = Literal['home', 'our-team', 'services', 'contact']