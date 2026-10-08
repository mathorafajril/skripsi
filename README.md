# Skripsi — AES System

An Automated Essay Scoring (AES) system for Indonesian-language essays, built on fastText word embeddings and a TensorFlow model.

This repository contains the source code for my undergraduate thesis (*skripsi*). It includes:

- a Jupyter notebook for training and evaluating the model (`Model_V4.ipynb`), and
- an application in `aes-system/`, made of a FastAPI machine learning service (`ml/`), a Node.js backend (`backend/`), and a PostgreSQL database.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Step 1: Clone the Repository](#step-1-clone-the-repository)
- [Step 2: Download the fastText Indonesian Embeddings (Required)](#step-2-download-the-fasttext-indonesian-embeddings-required)
- [Option A: Run Locally (without Docker)](#option-a-run-locally-without-docker)
- [Option B: Run with Docker](#option-b-run-with-docker)
- [Training / Reproducing the Model](#training--reproducing-the-model)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.111.0 | REST API framework |
| Uvicorn | 0.29.0 | ASGI server |
| Pydantic | 2.7.1 | Request/response validation |
| TensorFlow | 2.19.0 | Deep learning model |
| fasttext-wheel | 0.9.2 | Pre-trained Indonesian word embeddings |
| nlp_id | 0.1.21.0 | Indonesian text preprocessing |
| NumPy | 2.0.2 | Numerical computing |
| setuptools | < 70 | Required for compatibility with `fasttext-wheel` / `nlp_id` |

## Repository Structure

```
skripsi/
├── aes-system/
│   ├── ml/                      # FastAPI + ML service
│   │   ├── data/                # <-- put the fastText model here (see Step 2)
│   │   ├── requirements.txt
│   │   ├── Dockerfile           # (template below)
│   │   ├── .dockerignore        # (template below)
│   │   └── main.py              # FastAPI entry point (app instance: `app`)
│   ├── backend/                 # Node.js backend service
│   │   ├── package.json
│   │   ├── Dockerfile           # (template below)
│   │   └── .dockerignore        # (template below)
│   ├── docker-compose.yml       # (template below)
│   └── .env.example             # (template below)
├── Model_V4.ipynb               # Model training & evaluation notebook (Google Colab)
├── build-log.txt                # Output of an earlier docker-compose build attempt
└── README.md
```

## Services & Ports

| Service | Description | Port |
|---------|-------------|------|
| `ml` | FastAPI machine learning service (essay scoring) | **8000** |
| `backend` | Node.js backend API | **8080** |
| `db` | PostgreSQL database | **5432** |

If one of these ports is already used on your computer, change the **left** side of the mapping in `docker-compose.yml` (e.g. `"5433:5432"`).

## Prerequisites

| Tool | Version | Needed for |
|------|---------|-----------|
| [Git](https://git-scm.com/downloads) | any recent | cloning the repo |
| [Python](https://www.python.org/downloads/) | **3.10 or 3.11** | ML service & notebook (local run) |
| [Node.js](https://nodejs.org/) | **20 LTS** or newer | backend (local run) |
| [PostgreSQL](https://www.postgresql.org/download/) | 14+ | database (local run) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | latest | Docker option only |
| Disk space | ~10 GB free | fastText model + TensorFlow |
| RAM | **8 GB+** | the fastText model is ~7 GB when loaded into memory |

> Python 3.12+ is not recommended: `fasttext-wheel==0.9.2` does not provide prebuilt packages for it.

## Step 1: Clone the Repository

```bash
git clone https://github.com/mathorafajril/skripsi.git
cd skripsi
```

## Step 2: Download the fastText Indonesian Embeddings (Required)

The application needs the pre-trained **fastText Indonesian 300-dimension** word vectors. The file is too large for GitHub, so you must download it yourself and place it in `aes-system/ml/data/`.

1. Go to the official fastText page: <https://fasttext.cc/docs/en/crawl-vectors.html>
2. Find **Indonesian** in the language list and download the **bin** file. It is named **`cc.id.300.bin.gz`** (about 4.5 GB).
3. Extract it so you get `cc.id.300.bin` (about 7 GB).
4. Place it here:

```
aes-system/ml/data/cc.id.300.bin
```

You can also do this from the terminal:

**macOS / Linux**

```bash
cd aes-system/ml
mkdir -p data && cd data
wget https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.id.300.bin.gz
gunzip cc.id.300.bin.gz
```

**Windows (PowerShell)** — or just download and extract it with a browser and 7-Zip.

```powershell
cd aes-system\ml
mkdir data -Force
cd data
Invoke-WebRequest -Uri https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.id.300.bin.gz -OutFile cc.id.300.bin.gz
# then extract cc.id.300.bin.gz with 7-Zip
```

## Option A: Run Locally (without Docker)

### 1. Create and activate a virtual environment

From the `aes-system/ml` folder:

```bash
cd aes-system/ml
```

**Windows (PowerShell)**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

`requirements.txt`:

```
setuptools<70

fastapi==0.111.0
numpy==2.0.2
uvicorn==0.29.0
pydantic==2.7.1
tensorflow==2.19.0
fasttext-wheel==0.9.2
nlp_id==0.1.21.0
```

### 3. Start the API

```bash
uvicorn main:app --reload --port 8000
```

Once it's running:

- API: <http://localhost:8000>
- Interactive docs (Swagger UI): <http://localhost:8000/docs>

> The first start takes a while because the large fastText model is loaded into memory.

### 4. Set up the database

Install [PostgreSQL](https://www.postgresql.org/download/), then create a user and a database:

```sql
CREATE USER aes_user WITH PASSWORD 'change_me';
CREATE DATABASE aes_db OWNER aes_user;
```

### 5. Set up and start the backend

Open a **new terminal** (keep the ML service running) and go to the backend folder:

```bash
cd aes-system/backend
```

Create a `.env` file in this folder:

```env
PORT=8080
DATABASE_URL=postgresql://aes_user:change_me@localhost:5432/aes_db
ML_SERVICE_URL=http://localhost:8000
```

Install the dependencies and start the server:

```bash
npm install
npm start
```

The backend is now available at <http://localhost:8080>.

## Option B: Run with Docker

Docker lets you run the service without installing Python or any dependencies yourself.

### 1. Install Docker

- **Windows / macOS:** install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure it is running.
- **Linux:** follow the [Docker Engine install guide](https://docs.docker.com/engine/install/) and the [Compose plugin guide](https://docs.docker.com/compose/install/linux/).

Verify:

```bash
docker --version
docker compose version
```

**Give Docker enough memory.** In Docker Desktop go to *Settings → Resources* and allow at least **8 GB** of RAM (more is better), otherwise the container may be killed while loading the fastText model.

### 2. Make sure you completed [Step 1](#step-1-clone-the-repository) and [Step 2](#step-2-download-the-fasttext-indonesian-embeddings-required)

The fastText file must exist at `aes-system/ml/data/cc.id.300.bin`. It is **not** copied into the Docker image (to keep the image small); it is mounted into the container as a volume.

### 3. Create the Docker files

Create the files below if they are not already in the repository.

**`aes-system/ml/Dockerfile`**

```dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the application code (the data/ folder is excluded by .dockerignore)
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`aes-system/ml/.dockerignore`**

```
venv/
__pycache__/
*.pyc
.git/
.ipynb_checkpoints/

# The fastText model is mounted as a volume, not baked into the image
data/
```

**`aes-system/backend/Dockerfile`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

**`aes-system/backend/.dockerignore`**

```
node_modules/
npm-debug.log
.env
.git/
```

**`aes-system/.env.example`** — copy it to `.env` and change the values:

```env
POSTGRES_USER=aes_user
POSTGRES_PASSWORD=change_me
POSTGRES_DB=aes_db
```

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

**`aes-system/docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: aes-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  ml:
    build:
      context: ./ml
    container_name: aes-ml
    ports:
      - "8000:8000"
    volumes:
      # Mount the fastText model from your computer into the container
      - ./ml/data:/app/data
    environment:
      - TF_CPP_MIN_LOG_LEVEL=2
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    container_name: aes-backend
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      # Inside Docker, use the service names (db, ml) instead of localhost
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      ML_SERVICE_URL: http://ml:8000
    depends_on:
      db:
        condition: service_healthy
      ml:
        condition: service_started
    restart: unless-stopped

volumes:
  pgdata:
```

> - If your code reads the fastText model from a different path inside the container, change `/app/data` in the `ml` volume mapping.
> - The backend reads `PORT`, `DATABASE_URL` and `ML_SERVICE_URL` from its environment.
> - Database data is stored in the `pgdata` volume, so it survives `docker compose down`. Use `docker compose down -v` to wipe it.

### 4. Build and start

`docker compose` must be run from the folder that contains `docker-compose.yml`:

```bash
cd aes-system
docker compose up --build
```

Run in the background instead:

```bash
docker compose up --build -d
```

The first build takes several minutes because TensorFlow is large. When it's ready:

- ML service: <http://localhost:8000> (Swagger UI: <http://localhost:8000/docs>)
- Backend: <http://localhost:8080>
- PostgreSQL: `localhost:5432` (use the credentials from your `.env`)

### 5. Useful Docker commands

```bash
docker compose logs -f      # follow logs
docker compose ps           # list running containers
docker compose down         # stop and remove containers
docker compose up --build   # rebuild after changing code or requirements
```

> Older Docker installs use `docker-compose` (with a hyphen). It works the same way.

## Training / Reproducing the Model

The model is developed in `Model_V4.ipynb`, which was run on **Google Colab**.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/mathorafajril/skripsi/blob/main/Model_V4.ipynb)

### Dataset

The notebook uses the **Indonesian Query Answering Dataset for Online Essay Test System** (Rahutomo & Roshinta, 2018):

- Download: <https://data.mendeley.com/datasets/6gp8m72s9p/1>
- DOI: [10.17632/6gp8m72s9p.1](https://doi.org/10.17632/6gp8m72s9p.1)
- The data is provided as Excel spreadsheets.

### Run on Google Colab (recommended)

1. Click the **Open In Colab** badge above.
2. Upload the dataset files (and the fastText model from [Step 2](#step-2-download-the-fasttext-indonesian-embeddings-required)) to Colab or your Google Drive. Google Drive is easier for the large fastText file; mount it with:

   ```python
   from google.colab import drive
   drive.mount('/content/drive')
   ```

3. Update the file paths in the notebook so they point to where you stored the files.
4. Run all cells from top to bottom (**Runtime → Run all**).

### Run locally (optional)

```bash
pip install jupyter
jupyter notebook Model_V4.ipynb
```

Use the dependencies from `aes-system/ml/requirements.txt` and install any extra libraries the notebook imports.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `no configuration file provided: not found` | You're in the wrong folder. `cd aes-system` (the folder with `docker-compose.yml`) and retry. |
| Container exits or "Killed" while starting | Not enough RAM. Increase Docker Desktop memory to 8 GB or more. |
| `ValueError: ... cc.id.300.bin cannot be opened` / file not found | The fastText model is missing or in the wrong place. Re-check [Step 2](#step-2-download-the-fasttext-indonesian-embeddings-required). |
| `pip` fails building `fasttext-wheel` | Use Python 3.10 or 3.11. |
| `ModuleNotFoundError: pkg_resources` | Keep `setuptools<70` in `requirements.txt` and reinstall. |
| `Cannot connect to the Docker daemon` | Start Docker Desktop and wait until it says it's running. |
| `port is already allocated` | Another program uses that port (often `5432` if PostgreSQL is installed locally). Change the left side of the mapping, e.g. `"5433:5432"`. |
| Backend can't connect to the database in Docker | Use the service name `db` as the host (not `localhost`), and make sure the credentials match your `.env`. |
| `variable is not set` warnings from Compose | Create the `.env` file (see Step 3) in the same folder as `docker-compose.yml`. |
| PowerShell blocks `Activate.ps1` | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again. |

## Author

**Fajril Mathora** — [@mathorafajril](https://github.com/mathorafajril)

## License
