from src.app import app
from src.config.application import ApplicationConfig

if __name__ == "__main__":
    port = ApplicationConfig.APPLICATION["port"]
    server_url = ApplicationConfig.APPLICATION["server_url"]
    node_env = ApplicationConfig.APPLICATION["node_environment"]
    frontend_url = ApplicationConfig.CORS_OPTIONS["origin"]

    # Build the URL (add port only in dev mode)
    if node_env == "production":
        url = f"{server_url}"
    else:
        url = f"{server_url}:{port}"

    print(f"Server running on {url} with frontend {frontend_url}")

    # Start Flask server
    app.run(
        host="0.0.0.0",   
        port=port,
        debug=(node_env == "development")  # enable hot reload in dev
    )