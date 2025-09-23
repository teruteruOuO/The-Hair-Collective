from src.app import app
from src.config.application import ApplicationConfig

if __name__ == "__main__":
    port = ApplicationConfig.APPLICATION["port"]
    server_url = ApplicationConfig.APPLICATION["server_url"]
    node_env = ApplicationConfig.APPLICATION["node_environment"]
    frontend_url = ApplicationConfig.CORS_OPTIONS["origin"]

    # Build the URL (add port only in dev mode)
    print(f"Server running on {server_url}:{port} with frontend {frontend_url}")
    
    # Default = no SSL
    ssl_context = None

    if node_env == 'production':
        ssl_cert = ApplicationConfig.SSL.get("cert_path")
        ssl_key = ApplicationConfig.SSL.get("key_path")

        if ssl_cert and ssl_key:
            ssl_context = (ssl_cert, ssl_key)

    # Start Flask server
    app.run(
        host="0.0.0.0",   
        port=port,
        debug=(node_env == "development"),  # enable hot reload in dev
        ssl_context=ssl_context
    )