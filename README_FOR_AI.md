# CipherNode - Project Context for AI Diagram Generation

This document provides a comprehensive overview of the `CipherNode` project architecture, database schema, and data flows. 
**Objective for AI:** Please use the information provided below to generate a detailed **Entity-Relationship Diagram (ERD)** and a **Data Flow Diagram (DFD)** for this application.

## 1. Project Overview & Tech Stack
**Project Name:** CipherNode (also referred to as SafeChat in emergency contexts)
**Type:** Real-time Chat Application with integrated Emergency/SOS Alert System.

**Tech Stack:**
*   **Frontend:** React (Vite/App.jsx)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (via Mongoose)
*   **Real-time Communication:** Socket.io
*   **Image Storage:** Cloudinary
*   **Email Notifications:** Resend API
*   **Authentication:** JWT (JSON Web Tokens) & bcryptjs
*   **Security/Rate Limiting:** Arcjet (based on dependencies)

---

## 2. Database Schema (For Entity-Relationship Diagram - ERD)

The application uses MongoDB. Here are the exact Mongoose schema definitions for the core entities:

### Entity: `User`
Stores user profile information and their trusted emergency contacts.
*   `_id`: ObjectId (Primary Key)
*   `email`: String (Required, Unique)
*   `fullName`: String (Required)
*   `password`: String (Required, Hashed)
*   `profilePic`: String (URL to Cloudinary, Default: "")
*   `trustedContacts`: Array of ObjectIds (References `User` Entity)
*   `createdAt`: Timestamp
*   `updatedAt`: Timestamp

### Entity: `Message`
Stores chat messages between users.
*   `_id`: ObjectId (Primary Key)
*   `senderId`: ObjectId (Required, References `User` Entity)
*   `receiverId`: ObjectId (Required, References `User` Entity)
*   `text`: String (Max length: 2000)
*   `image`: String (URL to Cloudinary)
*   `createdAt`: Timestamp
*   `updatedAt`: Timestamp

### Entity: `EmergencyLog`
Logs when a user triggers an SOS/Emergency alert.
*   `_id`: ObjectId (Primary Key)
*   `userId`: ObjectId (Required, References `User` Entity)
*   `location`: Object containing:
    *   `latitude`: Number
    *   `longitude`: Number
*   `status`: String (Default: "triggered")
*   `createdAt`: Timestamp
*   `updatedAt`: Timestamp

**Relationships:**
*   **User to User (Trusted Contacts):** A User can have multiple other Users as trusted contacts (Self-Referencing, One-to-Many or Many-to-Many conceptually).
*   **User to Message:** A User (Sender) can have many Messages. A User (Receiver) can have many Messages (One-to-Many).
*   **User to EmergencyLog:** A User can have many EmergencyLogs (One-to-Many).

---

## 3. Core Processes & Data Flows (For Data Flow Diagram - DFD)

Below are the primary processes happening within the system to help you map the Level 0 and Level 1 DFDs.

### Process 1: User Authentication (Login/Signup)
*   **Entities:** User (Client), Backend Server, MongoDB
*   **Flow:** 
    1. User submits credentials to `/api/auth` routes.
    2. Backend validates against MongoDB (`User` collection).
    3. If valid, backend generates a JWT and sets it in an HTTP-only cookie.
    4. Backend returns user data to the Client.

### Process 2: Real-Time Messaging
*   **Entities:** Sender (Client), Receiver (Client), Backend Server (Socket.io), MongoDB
*   **Flow:**
    1. Sender sends a message payload (text/image) via REST API or Socket emission.
    2. Backend receives the message and saves it to MongoDB (`Message` collection).
    3. Backend identifies the `receiverId`.
    4. If the receiver is currently connected via Socket.io, the backend emits the message event directly to the receiver's socket.
    5. The Receiver's frontend updates the UI dynamically.

### Process 3: Emergency / SOS Alert System (SafeChat Feature)
*   **Entities:** Victim (Client), Trusted Contacts (Client/Email), Backend Server, MongoDB, Resend (External API)
*   **Flow:**
    1. Victim triggers an SOS alert (e.g., via a secret keyword or button).
    2. Client fetches the Victim's current Geolocation (Latitude/Longitude).
    3. Client sends SOS payload to Backend.
    4. Backend creates a new entry in MongoDB (`EmergencyLog` collection).
    5. Backend retrieves the Victim's `trustedContacts` list from the `User` collection.
    6. **Action A (Real-time):** Backend uses Socket.io to emit an emergency alert directly to any trusted contacts currently online.
    7. **Action B (Email):** Backend uses the Resend API to send emergency emails (with location data) to the trusted contacts.

### Process 4: Profile and Media Upload
*   **Entities:** User (Client), Backend Server, Cloudinary (External API), MongoDB
*   **Flow:**
    1. User uploads a profile picture or image message.
    2. Backend receives the base64 or multipart form data.
    3. Backend uploads the image to Cloudinary.
    4. Cloudinary returns a secure URL.
    5. Backend saves this URL in the respective MongoDB document (`User.profilePic` or `Message.image`).
