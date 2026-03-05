# ✨ Freelancer Signature

<div align="center">

![Freelancer Signature](https://img.shields.io/badge/Freelancer-Signature-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional email signature generator designed specifically for freelancers**

Create stunning, professional email signatures in minutes with our easy-to-use signature generator. Perfect for freelancers who want to make a great impression with every email.

[🚀 Live Demo](https://freelancersignature.web.app) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

## � What This Does

Freelancer Signature helps you create professional email signatures that:
- ✨ **Showcase your brand** with custom colors and layouts
- 📱 **Work on all devices** with mobile-responsive design
- 🔗 **Include your social media** and portfolio links
- 📸 **Add your profile photo** with built-in cropping
- 📧 **Export to multiple formats** (HTML, PNG, PDF)
- 💾 **Save and manage** multiple signatures

## � Features

### 🎨 **Beautiful Signatures**
- Modern, professional templates designed for freelancers
- Customizable colors, fonts, and layouts
- Support for multiple social media platforms (LinkedIn, Twitter, GitHub, Instagram)
- Mobile-responsive signatures that look great on any device
- Professional photo upload with automatic cropping

### 🔧 **Easy to Use**
- Intuitive drag-and-drop interface
- Real-time preview as you customize
- No design skills required
- Pre-made templates to get you started
- One-click export to multiple formats

### 📤 **Export Options**
- **HTML** - Perfect for email clients (Gmail, Outlook, Apple Mail)
- **PNG** - High-quality image for direct sharing
- **PDF** - For documentation and portfolios
- **Copy to clipboard** - Instantly paste into your email

### 🔐 **Secure & Private**
- Firebase authentication for secure access
- Your signatures are stored privately
- No tracking or analytics
- Your data stays yours - we don't sell or share it

### ⚡ **Fast & Reliable**
- Lightning-fast signature generation
- Works offline once loaded
- Optimized for all devices and browsers
- Progressive Web App (PWA) ready

## 🚀 Quick Start

### 🌐 Try It Now

**Easiest option:** Use our live demo at [freelancersignature.web.app](https://freelancersignature.web.app)

No installation required - just sign in and start creating!

### � Local Development

Want to run it locally or contribute? Here's how:

#### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BoraKurucu/freelancersignature.git
   cd freelancersignature
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
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

> **Note:** For local development, you'll need to set up your own Firebase project. See [Firebase Setup](#firebase-setup) below.

## 📖 Documentation

### 🏗️ Project Structure

```
freelancersignature/
├── src/
│   ├── components/          # React components
│   │   ├── SignatureBuilder.js    # Main signature generator
│   │   ├── SignaturePreview.js    # Live preview component
│   │   ├── UserMenu.js           # User authentication menu
│   │   └── ...                  # Other UI components
│   ├── firebase/           # Firebase configuration
│   │   └── config.js              # Firebase setup
│   ├── services/           # API services
│   │   ├── signatureService.js    # Signature operations
│   │   └── gumroadService.js      # Payment processing
│   ├── context/            # React Context
│   │   └── AuthContext.js         # Authentication state
│   └── utils/              # Utility functions
│       └── security.js            # Security helpers
├── functions/              # Firebase Cloud Functions
│   ├── index.js                 # Main functions file
│   └── signatureGenerator.js    # Signature generation logic
├── public/                 # Static assets
└── build/                  # Production build
```

### 🔧 Firebase Setup

#### For Local Development
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication → Sign-in method → Google
3. Set up Firestore Database in test mode
4. Enable Firebase Hosting
5. Go to Project Settings → General → Your apps → Web → Create app
6. Copy the Firebase config and update your `.env` file

#### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Message sender ID | ✅ |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID | ❌ |

### 🎨 Customization Guide

#### Adding New Signature Templates
1. Create template styles in `src/components/SignatureBuilder.js`
2. Follow the existing template structure
3. Add to the template selector options

#### Styling
The app uses a combination of:
- **CSS Modules** for component-specific styles
- **Inline styles** for dynamic theming
- **Responsive design** for mobile compatibility

#### Colors and Themes
Customize colors by modifying the color palette in `src/components/SignatureBuilder.js`:
```javascript
const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  // Add your custom colors here
};
```

## 🚀 Deployment

### 🌐 Using the Live Version

The easiest way to use Freelancer Signature is through our live demo:

**[freelancersignature.web.app](https://freelancersignature.web.app)**

No setup required - just sign in with Google and start creating!

### 🔧 Deploy Your Own Version

#### Firebase Hosting (Recommended)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init hosting
   ```

4. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

#### Deploy Functions (Optional)
If you need backend functionality:
```bash
firebase deploy --only functions
```

> **Note:** Functions deployment requires additional IAM permissions. You may need to ask a project Owner to assign you the "Service Account User" role.

## 🤝 Contributing

We welcome contributions! Whether you're fixing a bug, adding a feature, or improving documentation, we'd love your help.

### 🚀 Quick Contribution Guide

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork:
   git clone https://github.com/YOUR_USERNAME/freelancersignature.git
   cd freelancersignature
   ```

2. **Set up your development environment**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your Firebase config
   npm start
   ```

3. **Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature: brief description of changes'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of your changes
   - Link any relevant issues
   - Include screenshots if applicable

### 🎯 Areas Where We Need Help

- 🎨 **New signature templates** - Creative designers wanted!
- 📱 **Mobile improvements** - Help us perfect mobile experience
- 🌍 **Internationalization** - Add support for different languages
- 📖 **Documentation** - Improve guides and examples
- 🐛 **Bug fixes** - Help us squash those bugs!

### 📝 Code Style Guidelines

- Use ESLint configuration provided (`npm run lint` to check)
- Follow React best practices and hooks rules
- Write meaningful commit messages (use conventional commits if possible)
- Keep components small and focused
- Add comments for complex logic
- Test your changes before submitting PRs

## 🐛 Troubleshooting

### 🔧 Common Issues & Solutions

#### 🔑 Firebase Configuration Errors
**Problem:** "Firebase project not found" or authentication errors

**Solution:**
- Ensure all environment variables are set correctly in `.env`
- Check that your Firebase project exists and is active
- Verify API key restrictions in Firebase Console
- Make sure Authentication is enabled with Google provider

#### 🏗️ Build Errors
**Problem:** Build fails with dependency errors

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

- Check Node.js version (requires 16+)
- Verify all dependencies are compatible
- Check for any syntax errors in your changes

#### 🚀 Deployment Issues
**Problem:** Firebase deployment fails

**Solution:**
- Check Firebase CLI authentication: `firebase login --list`
- Verify project configuration in `firebase.json`
- Ensure build directory exists: `npm run build`
- For functions deployment, ensure you have "Service Account User" IAM role

#### 📱 Mobile/Responsive Issues
**Problem:** Signature doesn't look good on mobile

**Solution:**
- Test in browser dev tools with mobile viewport
- Check CSS media queries
- Ensure images are properly sized
- Verify font sizes are readable on small screens

### 💬 Getting Help

- 📖 **Check this README first** - Most answers are here!
- 🐛 [**Open an Issue**](https://github.com/BoraKurucu/freelancersignature/issues) - For bugs and feature requests
- 💬 [**Start a Discussion**](https://github.com/BoraKurucu/freelancersignature/discussions) - For questions and ideas
- 📧 **Email us** - For private questions: [create an issue](https://github.com/BoraKurucu/freelancersignature/issues/new?template=question.md)

### 🆘 Before Asking for Help

Please include:
1. **What you tried** - Show your code/steps
2. **What happened** - Error messages, screenshots
3. **What you expected** - What should have happened
4. **Environment info** - Browser, OS, Node.js version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshot library
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/BoraKurucu/freelancersignature?style=social)
![GitHub forks](https://img.shields.io/github/forks/BoraKurucu/freelancersignature?style=social)
![GitHub issues](https://img.shields.io/github/issues/BoraKurucu/freelancersignature)
![GitHub pull requests](https://img.shields.io/github/issues-pr/BoraKurucu/freelancersignature)
![License](https://img.shields.io/github/license/BoraKurucu/freelancersignature)

---

<div align="center">

**Made with ❤️ for freelancers worldwide**

*Create professional signatures that make every email count*

[⬆️ Back to top](#-freelancer-signature)

**Star this repo if it helped you! ⭐**

</div>
