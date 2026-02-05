# SpeedTest FastAPI Backend

A complete Python FastAPI backend for the SpeedTest application.

## Features

- **Speed Testing**: Ping, download, and upload speed measurement
- **IP Geolocation**: Detailed IP information with VPN detection
- **Network Quality Scoring**: Smart scoring with activity recommendations
- **Server Regions**: Multiple server locations worldwide
- **Shareable Cards**: Generate beautiful result images

## API Endpoints

### Speed Test
- `POST /api/v1/speedtest/ping` - Measure latency
- `GET /api/v1/speedtest/download?size=1048576` - Download test
- `POST /api/v1/speedtest/upload` - Upload test

### Network
- `GET /api/v1/ip-info` - Get IP and geolocation
- `POST /api/v1/network-quality` - Calculate quality score
- `GET /api/v1/server-regions` - List available servers
- `POST /api/v1/generate-share-card` - Generate result image

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# or
uvicorn main:app --reload --port 8000
```

## Deployment

### Railway

1. Create a new Railway project
2. Connect your GitHub repo or upload the backend folder
3. Railway auto-detects Python and deploys
4. Set environment variables in Railway dashboard
5. Your API URL will be: `https://your-app.railway.app`

### Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Your API URL will be: `https://your-app.onrender.com`

### PythonAnywhere

1. Create a new Web App
2. Upload files via Files tab or git clone
3. Set up virtual environment and install requirements
4. Configure WSGI file to point to `main:app`
5. Your API URL will be: `https://yourusername.pythonanywhere.com`

### Docker

```bash
# Build image
docker build -t speedtest-api .

# Run container
docker run -p 8000:8000 speedtest-api
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| HOST | 0.0.0.0 | Server host |
| PORT | 8000 | Server port |
| DEBUG | false | Enable debug mode |
| CORS_ORIGINS | * | Allowed origins |

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test ping
curl -X POST http://localhost:8000/api/v1/speedtest/ping \
  -H "Content-Type: application/json" \
  -d '{"client_time": 1234567890, "seq": 0}'

# Test download
curl http://localhost:8000/api/v1/speedtest/download?size=1024

# Test IP info
curl http://localhost:8000/api/v1/ip-info
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
