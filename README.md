# ✨ Freelancer Signature

<div align="center">

![Freelancer Signature](https://img.shields.io/badge/Freelancer-Signature-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional email signature generator designed specifically for freelancers**

[🚀 Live Demo](https://freelancersignature.web.app) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

## 🌟 Features

### 🎨 **Beautiful Signatures**
- Modern, professional designs
- Customizable colors and layouts
- Support for multiple social media platforms
- Mobile-responsive signatures

### 🔧 **Easy Customization**
- Intuitive drag-and-drop interface
- Real-time preview
- Image upload and cropping
- Custom fields and links

### � **Export Options**
- HTML signature for email clients
- PNG image for direct sharing
- PDF for documentation
- Copy to clipboard functionality

### � **Secure & Private**
- Firebase authentication
- Secure data storage
- No tracking or analytics
- Your data stays yours

### ⚡ **Performance**
- Lightning-fast generation
- Optimized for all devices
- Progressive Web App ready
- Offline support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/freelancer-signature.git
   cd freelancer-signature
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Documentation

### 🏗️ Architecture

```
freelancer-signature/
├── src/
│   ├── components/          # React components
│   │   ├── Signature/       # Signature generator
│   │   ├── UI/             # Reusable UI components
│   │   └── Layout/         # Layout components
│   ├── firebase/           # Firebase configuration
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── styles/             # CSS and styling
├── functions/              # Firebase Cloud Functions
├── public/                 # Static assets
└── build/                  # Production build
```

### 🔧 Configuration

#### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google provider)
3. Set up Firestore Database
4. Configure Firebase Hosting
5. Download your configuration and update `.env`

#### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Message sender ID | ✅ |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID | ✅ |

### 🎨 Customization

#### Adding New Signature Templates
1. Create a new component in `src/components/Signature/templates/`
2. Follow the existing template structure
3. Add to template selector in `src/components/Signature/SignatureTemplates.js`

#### Styling
The app uses Tailwind CSS for styling. Customize the theme in `src/styles/tailwind.config.js`.

## 🚀 Deployment

### Firebase Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

3. **Deploy functions (if needed)**
   ```bash
   firebase deploy --only functions
   ```

### Automatic Deployment
The project includes GitHub Actions for automatic deployment. Set up the following secrets in your GitHub repository:

- `FIREBASE_TOKEN`
- `FIREBASE_PROJECT_ID`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

## 🐛 Troubleshooting

### Common Issues

#### Firebase Configuration Errors
- Ensure all environment variables are set correctly
- Check Firebase project settings
- Verify API key restrictions

#### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

#### Deployment Issues
- Check Firebase CLI authentication: `firebase login`
- Verify project configuration in `firebase.json`
- Ensure build directory exists

### Getting Help
- 📖 Check the [Documentation](#documentation)
- 🐛 [Open an Issue](https://github.com/yourusername/freelancer-signature/issues)
- 💬 [Start a Discussion](https://github.com/yourusername/freelancer-signature/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshot library
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/freelancer-signature?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/freelancer-signature?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/freelancer-signature)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/freelancer-signature)

---

<div align="center">

**Made with ❤️ for freelancers worldwide**

[⬆️ Back to top](#-freelancer-signature)

</div>
