# Lets Retro In 3

A retrospective application with a **React** frontend (Vite) and a **FastAPI** backend.

---

## Project Structure

```
lets-retro-in-3/
├── backend/          # FastAPI backend
│   ├── main.py
│   └── requirements.txt
└── frontend/         # React frontend (Vite)
    ├── src/
    ├── index.html
    └── package.json
```

---

## Getting Started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**.  
Interactive docs: **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**.
