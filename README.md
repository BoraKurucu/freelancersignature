# Freelancer Email Signature Generator

A modern web application built with React and Firebase for creating professional email signatures specifically designed for freelancers.

## Features

- 🎨 **Beautiful UI**: Modern, responsive design with a gradient background
- ⚡ **Quick & Easy**: Build your signature in minutes with an intuitive form
- 📋 **Copy to Clipboard**: One-click HTML copy for easy integration
- 💾 **Save & Manage**: Store multiple signatures in Firebase Firestore
- 🎯 **Customizable**: Choose colors, fonts, and include/exclude sections
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Firebase Firestore** - Database for storing signatures
- **Firebase Hosting** - Web hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd freelancersignature
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings > General > Your apps
   - Update `src/firebase/config.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. Set up Firestore:
   - In Firebase Console, go to Firestore Database
   - Create a database in test mode (or production mode with proper security rules)
   - The app will automatically create a `signatures` collection

5. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
freelancersignature/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Home.js          # Landing page
│   │   ├── SignatureBuilder.js  # Main signature creation form
│   │   ├── SignaturePreview.js   # Live preview component
│   │   └── MySignatures.js       # Saved signatures list
│   ├── firebase/
│   │   └── config.js        # Firebase configuration
│   ├── services/
│   │   └── signatureService.js   # Firestore operations
│   ├── App.js               # Main app component with routing
│   ├── App.css
│   ├── index.js             # React entry point
│   └── index.css
├── firebase.json            # Firebase hosting configuration
├── package.json
└── README.md
```

## Usage

1. **Create a Signature**:
   - Click "Create Your Signature" on the home page
   - Fill in your personal information (name, email, title, etc.)
   - Add social media links (LinkedIn, Twitter, GitHub, Portfolio)
   - Customize colors and fonts
   - Preview your signature in real-time
   - Click "Copy HTML" to copy the signature code
   - Click "Save Signature" to store it in Firebase

2. **Manage Signatures**:
   - Go to "My Signatures" to view all saved signatures
   - Copy any signature's HTML code
   - Delete signatures you no longer need

3. **Use Your Signature**:
   - Paste the copied HTML code into your email client's signature settings
   - Most email clients (Gmail, Outlook, Apple Mail, etc.) support HTML signatures

## Deployment

### Deploy to Firebase Hosting

1. Build the React app:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

Make sure you have Firebase CLI installed:
```bash
npm install -g firebase-tools
firebase login
firebase init
```

## Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /signatures/{signatureId} {
      allow read, write: if request.auth != null;
      // Or for public access (less secure):
      // allow read, write: if true;
    }
  }
}
```

## Future Enhancements

- User authentication for private signature storage
- More signature templates and designs
- Image upload for logos/avatars
- Export as image (PNG/JPG)
- Email client-specific optimizations
- Signature analytics

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
