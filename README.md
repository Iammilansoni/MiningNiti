# 🚛 MiningNiti – AI-Powered Mining Regulations Assistant

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://miningniti.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-blue)](https://langchain.com)

**MiningNiti** is an AI-powered document management and retrieval system for Indian mining regulations. Built using Next.js, FastAPI, FAISS, LangChain, and Google Gemini, it provides a seamless experience for accessing and querying mining documents.

🏆 **Winner – Smart India Hackathon 2023** (CMPDI Problem Statement)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| � **PDF Upload & Indexing** | Upload mining PDFs, automatically extract and index content |
| 🤖 **RAG-Powered Q&A** | Context-aware answers using FAISS vector search |
| ⚡ **Streaming Responses** | Token-by-token streaming like ChatGPT |
| � **Source Citations** | See exactly which document and page answered your query |
| 🎨 **Markdown Rendering** | Proper formatting for code, lists, and headers |
| � **Voice Playback** | Listen to responses with text-to-speech |
| � **Dark/Light Mode** | Beautiful UI with theme support |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 14    │────▶│   FastAPI       │────▶│  Google Gemini  │
│   Frontend      │◀────│   Backend       │◀────│  LLM            │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  FAISS Vector   │
                        │  Store          │
                        └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python, FastAPI, LangChain, FAISS |
| LLM | Google Gemini 1.5 Flash |
| Embeddings | HuggingFace sentence-transformers |
| Auth | Clerk |
| Deployment | Vercel (frontend), Render (backend) |

---

## � Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google API Key ([get one free](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Iammilansoni/MiningNiti.git
cd MiningNiti
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Run backend
uvicorn main:app --reload --port 8000
```

### 3. Setup Frontend

```bash
# In a new terminal, from project root
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if needed

# Run frontend
npm run dev
```

### 4. Test the App

1. Open http://localhost:3000/chatting
2. Upload a PDF document
3. Ask questions about the content
4. See streaming responses with source citations!

---

## 📁 Project Structure

```
MiningNiti/
├── app/                    # Next.js App Router
│   ├── (chatting)/        # Chat feature
│   │   └── chatting/      # Main chat page
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── sections/         # Page sections
├── backend/              # FastAPI backend
│   ├── main.py          # API endpoints
│   ├── rag/             # RAG pipeline
│   │   ├── pdf_processor.py
│   │   ├── embeddings.py
│   │   └── chain.py
│   └── requirements.txt
└── public/               # Static assets
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variable: `NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com`
3. Deploy

### Backend (Render)

1. Create a new Web Service on Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `GOOGLE_API_KEY=your_key`
5. Deploy

---

## 📸 Screenshots

| Landing Page | Chat Interface |
|---|---|
| ![Landing](https://miningniti.vercel.app/og-image.png) | ![Chat](https://miningniti.vercel.app/og-image.png) |

> 🔗 **[Live Demo →](https://miningniti.vercel.app)**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 👨‍� Author

**Milan Soni**  
B.Tech CSE | Global Institute of Technology, Jaipur  
🏆 Winner – Smart India Hackathon 2023  
📬 [LinkedIn](https://www.linkedin.com/in/milansoni/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> ⭐ If you like this project, give it a star on GitHub!
