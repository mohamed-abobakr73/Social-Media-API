
# 🌐 Social Media Platform API

**Social Media API** is a feature-rich, secure, and scalable back-end solution for a social media platform. Built using **Express.js**, **MongoDB**, **TypeScript**, and **Socket.IO**, it enables robust user interaction, real-time messaging, and secure content management.

This API supports common social media features such as friend requests, user blocking, chat, and media sharing with cloud storage—all secured with JWT authentication.

---

## 🚀 Key Features

- 🔐 **Authentication & Authorization** – Secure access with JWT-based login, registration, and route protection.
- 👥 **User Interactions** – Friend requests, follow/unfollow, user blocking, and profile management.
- 💬 **Real-Time Messaging** – Instant messaging via WebSockets using **Socket.IO**.
- 🧾 **Group & Page Creation** – Users can create and manage groups or pages to foster community interaction.
- ☁️ **Media Uploads** – Upload profile pictures, posts, and attachments using **Multer** and **Cloudinary**.
- 📦 **MongoDB Efficiency** – Leveraged referencing and embedding for optimized document relationships and performance.

---

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB**
- **JWT (JSON Web Tokens)**
- **Socket.IO**
- **Multer** (for file uploads)
- **Cloudinary** (for media storage)
- **Postman** (for API testing)

---

## ⚙️ Getting Started

### 📌 Prerequisites

Make sure you have the following installed:

- Node.js v18+
- MongoDB
- A Cloudinary account
- Postman (optional, for testing)

---

### 🧑‍💻 Installation

```bash
git clone https://github.com/mohamed-abobakr73/Social-Media-API.git
cd Social-Media-API
npm install
```

---

### ⚙️ Environment Configuration

Create a `.env` file in the root directory and add your environment variables:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### ▶️ Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 🤝 Contributing

Feel free to open issues or submit pull requests. Contributions are welcome to improve features, fix bugs, or enhance documentation.

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).
