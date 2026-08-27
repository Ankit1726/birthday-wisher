Absolutely. Below is a polished **GitHub `README.md`** for your **Birthday Wish Album** project, following the same visual style as your EmotiSense README, but making it more professional and portfolio-friendly.

I’ve included:

* 🚀 Live Demo section
* 📸 Multiple screenshot/image sections
* ✨ Project overview
* 🏗️ Architecture
* 🛠️ Tech stack
* 🔐 Authentication/security
* 🗄️ MongoDB Atlas
* 🎨 Theme and animation details
* 🎵 Song/audio functionality
* 🐳 Docker + Render deployment
* 📁 Project structure
* ⚙️ Local setup
* 🔮 Future enhancements
* 👨‍💻 Developer section

<div align="center">

# 🎂 **Birthday Wish Album**

### 💖 **Create. Personalize. Celebrate.**

**A private animated birthday album built with FastAPI, MongoDB Atlas, HTML, CSS & JavaScript**

**Photo • Birthday Wish • Music • Locket Animation • Cake • Confetti • Balloons • Shareable Album**

<p align="center">

<img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi"/>
<img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/JavaScript-Frontend-yellow?style=for-the-badge&logo=javascript"/>
<img src="https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker"/>
<img src="https://img.shields.io/badge/Render-Deployed-purple?style=for-the-badge"/>

</p>

<p align="center">

<a href="https://YOUR-APP.onrender.com" target="_blank">
<img src="https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Now-success?style=for-the-badge">
</a>

</p>

<p align="center">

**Made with ❤️ by Ankit Gupta**

</p>

</div>

---

# 🎂 About The Project

**Birthday Wish Album** is a private and personalized web application designed to create beautiful digital birthday experiences for someone special.

Instead of sending a normal birthday message, the application lets you create an interactive birthday album containing:

* 📸 Personal photo
* 💌 Custom birthday wish
* 🎵 Personal songs
* 💖 Animated heart-shaped locket
* 🎂 Birthday cake interaction
* 🕯️ Candle-blowing animation
* 🎈 Floating balloons
* 🎉 Confetti effects
* ✨ Sparkles and floating hearts
* 🎨 Multiple pink-based themes
* 🔗 Shareable public album link

The application provides a complete flow:

```text
Register / Login
       ↓
Personal Dashboard
       ↓
Create Birthday Album
       ↓
Add Photo + Wish + Songs
       ↓
Choose Theme & Animations
       ↓
Save Album
       ↓
Generate Shareable Link
       ↓
Interactive Birthday Experience ❤️
```

---

# 🚀 Live Demo

<p align="center">

<a href="https://YOUR-APP.onrender.com" target="_blank">

<img src="https://img.shields.io/badge/🚀%20OPEN%20LIVE%20APPLICATION-success?style=for-the-badge&logo=render"/>

</a>

</p>

🌐 **Live Application:**
[https://YOUR-APP.onrender.com](https://YOUR-APP.onrender.com)

> Replace `https://YOUR-APP.onrender.com` with your actual Render URL.

---

# 📸 Project Showcase

## 🏠 Login & Authentication

The first screen allows the creator to securely register and log in before accessing their birthday albums.

<p align="center">
<img src="./preview/login.png" width="90%" alt="Login Page"/>
</p>

---

## 📊 Personal Dashboard

After login, the creator can view existing birthday albums and create a new album.

<p align="center">
<img src="./preview/dashboard.png" width="90%" alt="Dashboard"/>
</p>

---

## 🎨 Create Birthday Album

The creator can customize every important part of the birthday experience.

* Recipient name
* Birthday date
* Birthday message
* Personal photo
* Songs
* Theme
* Animation preferences

<p align="center">
<img src="./preview/create-album.png" width="90%" alt="Create Album Page"/>
</p>

---

## 💖 Interactive Birthday Album

The public album provides the main birthday experience with animations and interactive elements.

<p align="center">
<img src="./preview/album.png" width="90%" alt="Birthday Album"/>
</p>

---

## 🔐 Secure Private Album Creation

Each creator has their own authenticated account.

Only the album owner can:

* Create albums
* Edit albums
* Delete albums
* Upload media
* Manage album settings

The final album can then be shared using a public album URL.

---

# ✨ Key Features

## 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing
* 7-day session expiry
* Protected album management APIs
* Owner-based authorization

---

## 🎂 Personalized Birthday Album

Each album can contain:

```text
Recipient Name
       +
Birthday Date
       +
Custom Wish
       +
Personal Photo
       +
Songs
       +
Theme
       +
Animations
```

This makes every album unique.

---

## 💖 Animated Heart Locket

The signature interaction of the project is a heart-shaped locket.

```text
          💖
       ┌───────┐
       │       │
       │ PHOTO │
       │       │
       └───────┘
          ↓
       TAP / CLICK
          ↓
     💖 LOCKET OPENS
          ↓
       📸 PHOTO
```

The locket opens when the user interacts with it and reveals the recipient's photo.

---

## 🎉 Celebration Animations

The album supports multiple animations:

* 🎈 Floating balloons
* 💖 Floating hearts
* 🎊 Confetti
* ✨ Sparkles
* 🎂 Birthday cake
* 🕯️ Candle interaction
* 💫 Locket animation

Animations can be enabled or disabled from the album creation screen.

---

# 🎨 Theme Variants

Each album can have its own visual theme.

| Theme       | Description           |
| ----------- | --------------------- |
| 🌹 Rose     | Romantic pink/red     |
| 🌸 Blush    | Soft and elegant      |
| 💗 Magenta  | Vibrant pink          |
| 💜 Lavender | Purple-pink aesthetic |

Themes are controlled using CSS custom properties and the HTML `data-theme` attribute.

Example:

```html
<body data-theme="rose">
```

---

# 🎵 Music & Songs

The album supports personalized birthday music.

Users can:

### Upload Audio

Supported formats include:

```text
MP3
WAV
OGG
M4A
AAC
FLAC
```

### Fetch Public Audio

The creator can provide a direct public audio URL.

```text
Public MP3/WAV/OGG/M4A/AAC/FLAC URL
                  ↓
             Backend Fetch
                  ↓
          Store in MongoDB
                  ↓
          /api/media/{id}
                  ↓
             Album Player
```

Spotify and YouTube page URLs are intentionally rejected because they are not direct audio files.

---

# 🧠 Application Architecture

```text
                       ┌──────────────────────┐
                       │       Browser        │
                       │ HTML + CSS + JS      │
                       └──────────┬───────────┘
                                  │
                                  │ HTTP / REST API
                                  ▼
                       ┌──────────────────────┐
                       │       FastAPI        │
                       │      Backend         │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌────────────┐      ┌────────────┐      ┌────────────┐
       │    JWT     │      │   Album    │      │   Media    │
       │    Auth    │      │   CRUD     │      │  Storage   │
       └────────────┘      └────────────┘      └────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │    MongoDB Atlas     │
                       │                      │
                       │ Users                │
                       │ Albums               │
                       │ Photos               │
                       │ Songs                │
                       └──────────────────────┘
```

---

# 🏗️ Project Flow

```text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Register/Login│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Dashboard   │
                    └───────┬───────┘
                            │
                     Create Album
                            │
                            ▼
              ┌─────────────────────────┐
              │ Album Configuration     │
              │                         │
              │ Name                    │
              │ Birthday                │
              │ Wish                    │
              │ Photo                   │
              │ Songs                   │
              │ Theme                   │
              │ Animations              │
              └────────────┬────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   MongoDB Atlas │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Public Album URL│
                  └────────┬────────┘
                           │
                           ▼
                  🎂 Birthday Experience
```

---

# 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* CSS Keyframe Animations
* HTML Canvas
* Fetch API

### Backend

* Python 3.11
* FastAPI
* Pydantic
* JWT Authentication
* Async API architecture

### Database

* MongoDB Atlas
* Async MongoDB driver
* Document-based storage

### Deployment

* Docker
* Docker Compose
* Render

---

# 📁 Project Structure

```text
birthday-album/
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .dockerignore
├── .gitignore
├── README.md
│
├── app.py
│
├── backend/
│   │
│   ├── config.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── models.py
│   │
│   ├── auth/
│   │   ├── jwt.py
│   │   ├── password.py
│   │   └── dependencies.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── album.py
│   │   └── health.py
│   │
│   └── keepalive.py
│
└── frontend/
    │
    ├── index.html
    ├── dashboard.html
    ├── create.html
    ├── album.html
    │
    ├── css/
    │   └── style.css
    │
    └── js/
        ├── api.js
        ├── auth.js
        ├── create.js
        ├── album.js
        ├── hearts.js
        └── confetti.js
```

---

# 🗄️ MongoDB Data Model

The application uses MongoDB Atlas to store application data.

### Users

```text
users
│
├── _id
├── username
├── password_hash
└── created_at
```

### Albums

```text
albums
│
├── _id
├── owner_id
├── slug
├── recipient_name
├── birthday_date
├── wish_message
├── theme
├── animations
├── photo
├── songs
└── created_at
```

### Media

Uploaded photos and songs can be stored as MongoDB documents and served through the backend.

```text
Browser
   ↓
FastAPI
   ↓
MongoDB
   ↓
Media Document
   ↓
/api/media/{media_id}
   ↓
Browser
```

---

# 🔐 Security

Security was considered during the application design.

### Authentication

```text
Username + Password
        ↓
Password Verification
        ↓
JWT Token
        ↓
Authenticated API Requests
```

### Authorization

Album modification APIs verify:

```text
Current User
     ↓
Album Owner?
     ↓
YES → Allow
NO  → Reject
```

Only the album owner can edit or delete their albums.

---

# ⚙️ Environment Variables

Create a `.env` file locally:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=birthday_album

JWT_SECRET=your-long-random-secret

ALLOWED_ORIGINS=http://localhost:8000

SELF_URL=
KEEPALIVE_ENABLED=false
```

> Never commit `.env` to GitHub.

---

# 🚀 Local Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/birthday-album.git

cd birthday-album
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment

Create:

```text
.env
```

and add your MongoDB Atlas and JWT credentials.

---

## 5. Run Application

```bash
uvicorn app:app --reload --port 8000
```

Open:

```text
http://localhost:8000
```

---

# 🐳 Docker Deployment

Build the Docker image:

```bash
docker build -t birthday-album .
```

Run:

```bash
docker run -p 8000:8000 --env-file .env birthday-album
```

Or use Docker Compose:

```bash
docker-compose up --build
```

Health check:

```text
GET /health
```

---

# ☁️ Deploy to Render

The application is designed to run as a single Dockerized service on Render.

### Deployment Flow

```text
GitHub Repository
        ↓
      Render
        ↓
   Docker Build
        ↓
   Start Container
        ↓
     FastAPI
        ↓
 MongoDB Atlas
        ↓
   Live Website
```

### Required Environment Variables

Add these values in Render:

```text
MONGO_URI
MONGO_DB_NAME
JWT_SECRET
```

Optional:

```text
ALLOWED_ORIGINS
SELF_URL
KEEPALIVE_ENABLED
```

After the first deployment, set:

```text
SELF_URL=https://YOUR-APP.onrender.com
```

---

# ❤️ Example User Journey

```text
👤 Creator
   │
   ├── Register
   │
   ├── Login
   │
   └── Dashboard
          │
          └── Create New Album
                    │
                    ├── 👩 Recipient Name
                    ├── 📅 Birthday Date
                    ├── 💌 Birthday Wish
                    ├── 📸 Photo
                    ├── 🎵 Songs
                    ├── 🎨 Theme
                    └── ✨ Animations
                              │
                              ▼
                         💾 Save Album
                              │
                              ▼
                     🔗 Shareable Link
                              │
                              ▼
                     🎂 Birthday Album
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
             💖             🎵             🎉
           Locket          Music          Confetti
               │
               ▼
             🎂
        Birthday Celebration
```

---

# 🌟 Why I Built This

This project combines **web development, backend engineering, database management, authentication, media handling, animations and cloud deployment** into one complete application.

The goal was not simply to create another CRUD application.

The goal was to build something that feels **personal, interactive and memorable** while still demonstrating practical software engineering skills.

---

# 🎯 Key Learning Outcomes

Through this project, I worked with:

* FastAPI REST API development
* JWT authentication
* Password security
* MongoDB Atlas
* Async database operations
* File/media handling
* REST API design
* Frontend-backend integration
* Dynamic JavaScript UI
* CSS animations
* Canvas-based confetti
* Docker containerization
* Cloud deployment
* Environment-based configuration
* Public/private resource handling

---

# 🔮 Future Enhancements

Planned improvements include:

* 📧 Birthday reminder notifications
* 📱 Better mobile-first experience
* 🎁 Gift message section
* 🖼️ Multiple photo gallery
* 🎵 Multiple playlist support
* 💌 Animated letter/envelope
* 🔗 QR code for album sharing
* 📊 Album analytics
* 🌍 Custom domain support
* 🔒 Password-protected public albums
* ☁️ Cloud object storage for large media
* 🎨 More customizable themes
* 🌈 Custom color picker
* ✨ More interactive animations

---

# 🧪 API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Albums

```text
GET    /api/albums
POST   /api/albums
GET    /api/albums/{id}
PATCH  /api/albums/{id}
DELETE /api/albums/{id}
```

### Public Album

```text
GET /api/albums/public/{slug}
```

### Media

```text
POST /api/media/photo
POST /api/media/song
GET  /api/media/{media_id}
```

### Health

```text
GET /health
```

---

# 📸 Complete Project Preview

<p align="center">

<img src="./preview/login.png" width="45%" alt="Login"/>
<img src="./preview/dashboard.png" width="45%" alt="Dashboard"/>

</p>

<p align="center">

<img src="./preview/create-album.png" width="45%" alt="Create Album"/>
<img src="./preview/album.png" width="45%" alt="Birthday Album"/>

</p>

> Replace the image filenames above with your actual screenshots.

---

# ⭐ Support

If you like this project or find it useful for learning:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest improvements

---

<div align="center">

# 🎂 **Birthday Wish Album**

### **A little code. A little creativity. A lot of love. ❤️**

**Create a memory. Share a smile. Celebrate someone special.**

<br>

### 👨‍💻 **ANKIT GUPTA**

**AI Engineer • Python Developer • AIML Enthusiast**

**Building intelligent and meaningful applications**

<br>

**Made with ❤️ using Python, FastAPI, MongoDB & JavaScript**

</div>

