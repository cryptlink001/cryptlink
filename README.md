# 🌌 CryptLink - Encrypted Social Platform

A hybrid of WhatsApp + Telegram + Instagram with advanced privacy features and cyberpunk aesthetics.

## 🎯 Core Features
- **WhatsApp-style** private messaging with E2EE
- **Telegram-style** groups & channels  
- **Instagram-style** feed, reels, and stories
- **Username-only** identity system (no phone/email visible)
- **Advanced privacy** controls and hidden identity modes

## 🏗️ Architecture

### Backend (Spring Boot)
- Java 17 + Spring Boot 3.x
- PostgreSQL (primary database)
- Redis (sessions & real-time)
- WebSocket (chat)
- JWT Authentication

### Frontend (React)
- React 18 + TypeScript
- Tailwind CSS (cyberpunk UI)
- Zustand (state management)
- WebSocket client

### Database Schema
- **Users**: UUID, username (public), email/phone (private)
- **Messages**: Real-time chat with E2EE
- **Posts**: Feed content with media
- **Reels**: Short video content
- **Groups**: Telegram-style communities

## 🔐 Privacy Features
- Username-based identity (hide phone/email)
- Hidden online status
- Private reels (followers only)
- Self-destruct messages
- Incognito mode

## 🎨 Design System
- **Background**: #0a0a0f (deep black)
- **Primary**: Neon Purple #8b5cf6
- **Accent**: Blue #22d3ee
- **Style**: Glassmorphism + neon glow

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Redis

### Environment Variables
See `.env.example` files in both frontend and backend directories.

### Installation
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend  
cd frontend
npm install
npm start
```

## 📱 App Structure
- **Home**: Instagram-style feed
- **Reels**: TikTok-style short videos
- **Chat**: WhatsApp messaging
- **Explore**: Search & discover
- **Settings**: Privacy & security controls

## 🛠️ Tech Stack
- **Backend**: Spring Boot, PostgreSQL, Redis, WebSocket
- **Frontend**: React, Tailwind CSS, Zustand
- **Hosting**: Vercel (frontend), Railway/Render (backend)
- **Storage**: Cloudflare R2 / Supabase

## 🔑 Security Features
- JWT Authentication
- Password hashing (BCrypt)
- Rate limiting
- Input validation
- E2EE (Signal Protocol - planned)

## 📄 License
MIT License - see LICENSE file
