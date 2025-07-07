# Recipe Generator App

A single-page web application that helps you create delicious recipes from your available ingredients using AI-powered recipe generation.

## Features

### 🥕 Ingredient Management
- Add and remove ingredients from your available stock
- Ingredients are stored locally in your browser
- Clean, tag-based interface for easy management

### 🍳 Recipe Generation
- Describe what you're craving in natural language
- AI generates 3 unique recipe suggestions
- Recipes are formatted for easy reading with:
  - Ingredients list for 2 people
  - Step-by-step method with cooking times
  - Optional extras and garnishes

### ⚠️ Missing Ingredient Highlighting
- Ingredients not in your available list are highlighted in **bold red**
- Helps you quickly identify what you need to buy

### 💾 Save & Share
- Save your favorite recipes for later
- Share recipes with friends via clipboard
- All saved recipes persist between sessions

### 📱 Responsive Design
- Works perfectly on desktop, tablet, and mobile
- Modern, clean interface with smooth animations

## Getting Started

### Option 1: Quick Start (Local Development)
1. Download all files to a folder
2. Set up your OpenAI API key (see Option 2 below)
3. Open `index.html` in your web browser
4. Start adding ingredients and generating recipes!

**Note:** The app requires a valid OpenAI API key to generate recipes.

### Option 2: Docker Deployment (Recommended)
1. Ensure Docker and Docker Compose are installed
2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```
3. Open your browser and go to `http://localhost:8080`
4. Set up your OpenAI API key in the Settings page

**Alternative Docker commands:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the app
docker-compose down

# Update the app
docker-compose up -d --build
```

### Option 3: API Key Setup

To enable real AI-powered recipe generation:

1. **Get a ChatGPT API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key in your dashboard

2. **Set Up Your API Key**
   - Open the Recipe Generator app
   - Click the "Settings" link in the top-right corner
   - Enter your OpenAI API key in the API Key section
   - Click "Save API Key" to store it securely
   - Optionally test the connection with "Test Connection"

**Security Note:** Your API key is stored securely in your browser's local storage and never shared or transmitted to external servers.

## File Structure

```
Recipe App v2/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # Application logic and functionality
├── settings.html       # Settings page for API key management
├── settings.js         # Settings page functionality
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf          # Nginx server configuration
├── deploy.sh           # Deployment script
├── .dockerignore       # Docker ignore file
├── .gitignore          # Git ignore file for security
└── README.md           # This file
```

## How It Works

### Ingredient Management
- Ingredients are stored in browser localStorage
- Each ingredient is displayed as a removable tag
- Duplicate ingredients are prevented

### Recipe Generation Process
1. User enters available ingredients
2. User describes what they want to eat
3. App creates a prompt combining ingredients and preferences
4. ChatGPT generates 3 recipe suggestions
5. Missing ingredients are highlighted in bold red
6. User can save or share any recipe

### Data Persistence
- All data is stored locally in the browser
- No server required - everything works client-side
- Data persists between browser sessions

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, or layout
- The app uses CSS custom properties for easy theming
- Responsive breakpoints are clearly marked

### Recipe Format
- Edit the ChatGPT prompt in `script.js` to change recipe format
- Modify the `generateMockRecipes` function for different sample recipes

### Features
- Add new features by extending the `RecipeApp` class
- All methods are well-documented and modular

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported
- Requires JavaScript enabled

## Privacy & Security

- No data is sent to external servers (except ChatGPT API if enabled)
- All data is stored locally in your browser
- No user accounts or registration required
- Your ingredient lists and saved recipes stay private

## Troubleshooting

### Recipes Not Generating
- Ensure you have set up your OpenAI API key in the Settings page
- Check your internet connection
- Verify your ChatGPT API key is correct
- Check browser console for error messages

### Data Not Saving
- Ensure localStorage is enabled in your browser
- Try clearing browser cache and reloading

### Styling Issues
- Make sure all CSS files are in the same directory
- Check that Font Awesome CDN is accessible

## Future Enhancements

Potential features for future versions:
- Recipe categories and filtering
- Nutritional information
- Cooking time estimates
- Recipe difficulty ratings
- Export to PDF functionality
- Recipe scaling for different serving sizes

## Support

This is a client-side application that runs entirely in your browser. For issues or questions:
- Check the browser console for error messages
- Ensure all files are in the same directory
- Verify your ChatGPT API key if using real integration

---

**Enjoy cooking with your AI-powered recipe assistant! 🍽️** 