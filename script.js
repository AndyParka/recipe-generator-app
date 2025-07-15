class RecipeApp {
    constructor() {
        this.ingredients = [];
        this.savedRecipes = [];
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderIngredients();
        this.renderSavedRecipes();
        this.checkFirstTimeUser();
    }

    setupEventListeners() {
        // Add ingredient
        document.getElementById('addIngredient').addEventListener('click', () => this.addIngredient());
        document.getElementById('ingredientInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addIngredient();
        });

        // Generate recipes
        document.getElementById('generateRecipes').addEventListener('click', () => this.generateRecipes());

        // Welcome modal
        document.getElementById('closeWelcomeModal').addEventListener('click', () => this.closeWelcomeModal());
    }

    addIngredient() {
        const input = document.getElementById('ingredientInput');
        const ingredient = input.value.trim().toLowerCase();
        
        if (ingredient && !this.ingredients.includes(ingredient)) {
            this.ingredients.push(ingredient);
            this.saveToStorage();
            this.renderIngredients();
            input.value = '';
            this.showToast('Ingredient added!', 'success');
        } else if (this.ingredients.includes(ingredient)) {
            this.showToast('Ingredient already exists!', 'error');
        }
    }

    removeIngredient(ingredient) {
        this.ingredients = this.ingredients.filter(i => i !== ingredient);
        this.saveToStorage();
        this.renderIngredients();
        this.showToast('Ingredient removed!', 'success');
    }

    renderIngredients() {
        const container = document.getElementById('ingredientsList');
        container.innerHTML = '';
        
        this.ingredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <button class="remove-btn" onclick="app.removeIngredient('${ingredient}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tag);
        });
    }

    async generateRecipes() {
        const prompt = document.getElementById('promptInput').value.trim();
        
        if (this.ingredients.length === 0) {
            this.showToast('Please add some ingredients first!', 'error');
            return;
        }
        
        if (!prompt) {
            this.showToast('Please describe what you\'re craving!', 'error');
            return;
        }

        const recipesSection = document.getElementById('recipesSection');
        const loading = document.getElementById('loading');
        const container = document.getElementById('recipesContainer');
        const generateButton = document.getElementById('generateRecipes');

        recipesSection.style.display = 'block';
        loading.style.display = 'block';
        container.innerHTML = '';
        
        // Disable the generate button to prevent multiple clicks
        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            const recipes = await this.callChatGPT(prompt);
            this.displayRecipes(recipes);
        } catch (error) {
            console.error('Error generating recipes:', error);
            
            if (error.message.includes('No valid OpenAI API key')) {
                this.showToast('Please set up your OpenAI API key first. Check the README for instructions.', 'error');
            } else if (error.message.includes('Rate limit exceeded')) {
                this.showToast('Rate limit exceeded. Please wait 30 seconds and try again.', 'error');
            } else if (error.message.includes('Please wait, recipe generation in progress')) {
                this.showToast('Please wait, recipe generation in progress...', 'error');
            } else {
                this.showToast('Failed to generate recipes. Please try again.', 'error');
            }
        } finally {
            loading.style.display = 'none';
            // Re-enable the generate button
            generateButton.disabled = false;
            generateButton.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Recipes';
        }
    }

    async callChatGPT(prompt) {
        console.log('🔍 Debug: Starting recipe generation...');
        
        // Check if we have a valid API key from localStorage
        const apiKey = localStorage.getItem('recipeApp_openai_key');
        
        if (!apiKey) {
            console.error('❌ Debug: No API key found');
            // Show error if no valid API key is found
            throw new Error('No valid OpenAI API key found. Please set up your API key in the Settings page.');
        }

        console.log('✅ Debug: API key found, length:', apiKey.length);

        // Add rate limiting - prevent multiple simultaneous requests
        if (this.isGenerating) {
            console.warn('⚠️ Debug: Already generating, preventing duplicate request');
            throw new Error('Please wait, recipe generation in progress...');
        }

        this.isGenerating = true;
        console.log('🚀 Debug: Making API request to OpenAI...');

        try {
            console.log('📤 Debug: Sending request with ingredients:', this.ingredients);
            console.log('📤 Debug: User prompt:', prompt);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: 'You are a helpful cooking assistant. Generate exactly 3 simple recipes based on available ingredients and user preferences. Use the ingredients listed as a guide and add/remove ingredients as needed. Follow this EXACT format and use these examples as your guide for quality:\n\n1. Quick Stir-Fry Delight\nIngredients:\n- 2 cups mixed vegetables (from your available ingredients)\n- 1 cup protein (chicken, tofu, or beef if available)\n- 2 tbsp olive oil\n- 2 cloves garlic, minced\n- 1 tbsp soy sauce\n- Salt and pepper to taste\n\nMethod:\n- Heat olive oil in a large wok or pan over high heat (2 minutes)\n- Add minced garlic and stir for 30 seconds\n- Add protein and cook for 3-4 minutes until browned\n- Add vegetables and stir-fry for 4-5 minutes\n- Season with soy sauce, salt, and pepper\n- Serve hot over rice or noodles\n\nOptional Extras:\n- Garnish with fresh herbs or green onions\n- Add a squeeze of lime for brightness\n- Serve with steamed rice or noodles\n\n2. One-Pan Wonder\nIngredients:\n- 1 lb protein of choice\n- 2 cups vegetables\n- 1 cup grains (rice, quinoa, or pasta)\n- 2 tbsp olive oil\n- Herbs and spices to taste\n\nMethod:\n- Preheat oven to 400°F (5 minutes)\n- Season protein with herbs and spices (2 minutes)\n- Arrange protein and vegetables on a baking sheet (3 minutes)\n- Drizzle with olive oil and bake for 20-25 minutes\n- Cook grains separately according to package instructions\n- Serve protein and vegetables over grains\n\nOptional Extras:\n- Add a simple sauce made from available ingredients\n- Garnish with fresh herbs\n- Serve with a side salad\n\n3. Quick Soup or Stew\nIngredients:\n- 4 cups broth or water\n- 2 cups mixed vegetables\n- 1 cup protein\n- 1 onion, diced\n- 2 cloves garlic, minced\n- Herbs and spices to taste\n\nMethod:\n- Sauté onion and garlic in oil until softened (3 minutes)\n- Add protein and brown for 2-3 minutes\n- Add broth and bring to boil (5 minutes)\n- Add vegetables and simmer for 10-15 minutes\n- Season with herbs, salt, and pepper\n- Serve hot with bread or crackers\n\nOptional Extras:\n- Add a dollop of yogurt or cream for richness\n- Garnish with fresh herbs\n- Serve with crusty bread\n\nIMPORTANT: Follow this exact format with bullet points (-) for all lists. Include approximate timing in parentheses for method steps. Make recipes practical and easy to follow. If recipes would be too similar, include a wildcard recipe that uses only 1-2 of the listed ingredients. Do not use numbered steps in the method section.'
                    }, {
                        role: 'user',
                        content: "Available ingredients: " + this.ingredients.join(', ') + ". User request: " + prompt
                    }]
                })
            });
            
            console.log('📥 Debug: Response status:', response.status);
            
            if (!response.ok) {
                console.error('❌ Debug: API request failed with status:', response.status);
                let errorMessage = `API request failed: ${response.status}`;
                
                if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
                } else if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your settings.';
                } else if (response.status === 402) {
                    errorMessage = 'Payment required. Please add payment method to your OpenAI account.';
                } else if (response.status === 500) {
                    errorMessage = 'OpenAI service error. Please try again later.';
                }
                
                console.error('❌ Debug: Error message:', errorMessage);
                throw new Error(errorMessage);
            }
            
            console.log('✅ Debug: API request successful');
            
            const data = await response.json();
            console.log('📥 Debug: Received response data:', data);
            console.log('📝 Debug: Response content:', data.choices[0].message.content);
            
            const recipes = this.parseChatGPTResponse(data.choices[0].message.content);
            console.log('🍳 Debug: Parsed recipes:', recipes);
            return recipes;
            
        } catch (error) {
            console.error('❌ Debug: ChatGPT API error:', error);
            console.error('❌ Debug: Error message:', error.message);
            
            // Fallback to mock recipes for other errors
            this.showToast('API error, showing sample recipes', 'error');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.generateMockRecipes(prompt);

        } finally {

            this.isGenerating = false;
        }
    }

    parseChatGPTResponse(responseText) {
        console.log('🔍 Debug: Parsing ChatGPT response...');
        
        try {
            const recipes = [];
            const lines = responseText.split('\n');
            let currentRecipe = null;
            let currentSection = null;
            
            for (let line of lines) {
                line = line.trim();
                
                // Skip empty lines
                if (!line) continue;
                
                // Look for recipe titles (numbered recipes)
                if (line.match(/^\d+\.\s*[A-Z]/)) {
                    if (currentRecipe) {
                        recipes.push(currentRecipe);
                    }
                    currentRecipe = {
                        title: line.replace(/^\d+\.\s*/, ''),
                        ingredients: [],
                        method: [],
                        extras: []
                    };
                    currentSection = null;
                    console.log('🍳 Debug: Found recipe:', currentRecipe.title);
                }
                // Look for section headers
                else if (line.toLowerCase().includes('ingredients:')) {
                    currentSection = 'ingredients';
                    console.log('📝 Debug: Found ingredients section');
                }
                else if (line.toLowerCase().includes('method:') || line.toLowerCase().includes('instructions:')) {
                    currentSection = 'method';
                    console.log('📝 Debug: Found method section');
                }
                else if (line.toLowerCase().includes('optional') || line.toLowerCase().includes('garnish') || line.toLowerCase().includes('alternative')) {
                    currentSection = 'extras';
                    console.log('📝 Debug: Found extras section');
                }
                // Add content to current section
                else if (line && currentRecipe && currentSection) {
                    // Remove bullet points and clean up
                    if (line.startsWith('-') || line.startsWith('•')) {
                        line = line.substring(1).trim();
                    }
                    // Remove numbered steps
                    line = line.replace(/^\d+\.\s*/, '');
                    
                    if (line) {
                        currentRecipe[currentSection].push(line);
                        console.log(`📝 Debug: Added to ${currentSection}:`, line);
                    }
                }
            }
            
            // Add the last recipe
            if (currentRecipe) {
                recipes.push(currentRecipe);
            }
            
            console.log('🍳 Debug: Parsed recipes count:', recipes.length);
            
            // If we couldn't parse properly, fall back to mock recipes
            if (recipes.length === 0) {
                console.log('❌ Debug: Could not parse ChatGPT response, using mock recipes');
                return this.generateMockRecipes(prompt);
            }
            
            // Highlight missing ingredients
            recipes.forEach(recipe => {
                recipe.ingredients = recipe.ingredients.map(ingredient => {
                    const ingredientName = ingredient.toLowerCase();
                    const isAvailable = this.ingredients.some(available => 
                        ingredientName.includes(available)
                    );
                    
                    if (!isAvailable) {
                        return `<span class="missing-ingredient">${ingredient}</span>`;
                    }
                    return ingredient;
                });
            });
            
            return recipes;
            
        } catch (error) {
            console.error('❌ Debug: Error parsing ChatGPT response:', error);
            return this.generateMockRecipes(prompt);
        }
    }

    generateMockRecipes(prompt) {
        const availableIngredients = this.ingredients.join(', ');
        const commonIngredients = ['olive oil', 'salt', 'pepper', 'garlic', 'onion', 'butter'];
        
        const recipes = [
            {
                title: "Quick Stir-Fry Delight",
                ingredients: [
                    "2 cups mixed vegetables (from your available ingredients)",
                    "1 cup protein (chicken, tofu, or beef if available)",
                    "2 tbsp olive oil",
                    "2 cloves garlic, minced",
                    "1 tbsp soy sauce",
                    "Salt and pepper to taste"
                ],
                method: [
                    "Heat olive oil in a large wok or pan over high heat (2 minutes)",
                    "Add minced garlic and stir for 30 seconds",
                    "Add protein and cook for 3-4 minutes until browned",
                    "Add vegetables and stir-fry for 4-5 minutes",
                    "Season with soy sauce, salt, and pepper",
                    "Serve hot over rice or noodles"
                ],
                extras: [
                    "Garnish with fresh herbs or green onions",
                    "Add a squeeze of lime for brightness",
                    "Serve with steamed rice or noodles"
                ]
            },
            {
                title: "One-Pan Wonder",
                ingredients: [
                    "1 lb protein of choice",
                    "2 cups vegetables",
                    "1 cup grains (rice, quinoa, or pasta)",
                    "2 tbsp olive oil",
                    "Herbs and spices to taste"
                ],
                method: [
                    "Preheat oven to 400°F (5 minutes)",
                    "Season protein with herbs and spices (2 minutes)",
                    "Arrange protein and vegetables on a baking sheet (3 minutes)",
                    "Drizzle with olive oil and bake for 20-25 minutes",
                    "Cook grains separately according to package instructions",
                    "Serve protein and vegetables over grains"
                ],
                extras: [
                    "Add a simple sauce made from available ingredients",
                    "Garnish with fresh herbs",
                    "Serve with a side salad"
                ]
            },
            {
                title: "Quick Soup or Stew",
                ingredients: [
                    "4 cups broth or water",
                    "2 cups mixed vegetables",
                    "1 cup protein",
                    "1 onion, diced",
                    "2 cloves garlic, minced",
                    "Herbs and spices to taste"
                ],
                method: [
                    "Sauté onion and garlic in oil until softened (3 minutes)",
                    "Add protein and brown for 2-3 minutes",
                    "Add broth and bring to boil (5 minutes)",
                    "Add vegetables and simmer for 10-15 minutes",
                    "Season with herbs, salt, and pepper",
                    "Serve hot with bread or crackers"
                ],
                extras: [
                    "Add a dollop of yogurt or cream for richness",
                    "Garnish with fresh herbs",
                    "Serve with crusty bread"
                ]
            }
        ];

        // Highlight missing ingredients
        recipes.forEach(recipe => {
            recipe.ingredients = recipe.ingredients.map(ingredient => {
                const ingredientName = ingredient.toLowerCase();
                const isAvailable = this.ingredients.some(available => 
                    ingredientName.includes(available) || 
                    commonIngredients.some(common => ingredientName.includes(common))
                );
                
                if (!isAvailable && !ingredient.includes('(from your available ingredients)')) {
                    return `<span class="missing-ingredient">${ingredient}</span>`;
                }
                return ingredient;
            });
        });

        return recipes;
    }

    displayRecipes(recipes) {
        const container = document.getElementById('recipesContainer');
        container.innerHTML = '';

        recipes.forEach((recipe, index) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            // Only show Optional Extras section if there are extras
            const extrasSection = recipe.extras && recipe.extras.length > 0 
                ? `<h4>Optional Extras:</h4>
                   <ul>
                       ${recipe.extras.map(extra => `<li>${extra}</li>`).join('')}
                   </ul>`
                : '';
            
            recipeCard.innerHTML = `
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-content">
                    <h4>Ingredients (for 2 people):</h4>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                    
                    <h4>Method:</h4>
                    <ul>
                        ${recipe.method.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    
                    ${extrasSection}
                </div>
                <div class="recipe-actions">
                    <button class="btn btn-save" onclick="app.saveRecipe(${index})">
                        <i class="fas fa-heart"></i> Save Recipe
                    </button>
                    <button class="btn btn-share" onclick="app.shareRecipe(${index})">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            `;
            container.appendChild(recipeCard);
        });
    }

    saveRecipe(recipeIndex) {
        const recipesContainer = document.getElementById('recipesContainer');
        const recipeCard = recipesContainer.children[recipeIndex];
        
        if (recipeCard) {
            const recipeData = {
                title: recipeCard.querySelector('.recipe-title').textContent,
                content: recipeCard.querySelector('.recipe-content').innerHTML,
                timestamp: new Date().toISOString()
            };
            
            // The content already includes the conditional extras section from displayRecipes
            // so it will be saved correctly whether extras exist or not
            this.savedRecipes.push(recipeData);
            this.saveToStorage();
            this.renderSavedRecipes();
            this.showToast('Recipe saved!', 'success');
        }
    }

    removeSavedRecipe(index) {
        this.savedRecipes.splice(index, 1);
        this.saveToStorage();
        this.renderSavedRecipes();
        this.showToast('Recipe removed from saved!', 'success');
    }

    renderSavedRecipes() {
        const container = document.getElementById('savedRecipes');
        container.innerHTML = '';

        if (this.savedRecipes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No saved recipes yet. Generate some recipes and save your favorites!</p>';
            return;
        }

        this.savedRecipes.forEach((recipe, index) => {
            const recipeElement = document.createElement('div');
            recipeElement.className = 'saved-recipe';
            recipeElement.innerHTML = `
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-content">${recipe.content}</div>
                <div class="recipe-actions">
                    <button class="btn btn-share" onclick="app.shareSavedRecipe(${index})">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="btn btn-remove" onclick="app.removeSavedRecipe(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            container.appendChild(recipeElement);
        });
    }

    shareRecipe(recipeIndex) {
        const recipesContainer = document.getElementById('recipesContainer');
        const recipeCard = recipesContainer.children[recipeIndex];
        
        if (recipeCard) {
            const title = recipeCard.querySelector('.recipe-title').textContent;
            const content = recipeCard.querySelector('.recipe-content').textContent;
            const textToShare = `${title}\n\n${content}`;
            
            this.copyToClipboard(textToShare);
            this.showToast('Recipe copied to clipboard!', 'success');
        }
    }

    shareSavedRecipe(recipeIndex) {
        const recipe = this.savedRecipes[recipeIndex];
        if (recipe) {
            const textToShare = `${recipe.title}\n\n${recipe.content.replace(/<[^>]*>/g, '')}`;
            this.copyToClipboard(textToShare);
            this.showToast('Recipe copied to clipboard!', 'success');
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToStorage() {
        localStorage.setItem('recipeApp_ingredients', JSON.stringify(this.ingredients));
        localStorage.setItem('recipeApp_savedRecipes', JSON.stringify(this.savedRecipes));
    }

    loadFromStorage() {
        const savedIngredients = localStorage.getItem('recipeApp_ingredients');
        const savedRecipes = localStorage.getItem('recipeApp_savedRecipes');
        
        if (savedIngredients) {
            this.ingredients = JSON.parse(savedIngredients);
        }
        
        if (savedRecipes) {
            this.savedRecipes = JSON.parse(savedRecipes);
        }
    }

    checkFirstTimeUser() {
        const hasSeenWelcome = localStorage.getItem('recipeApp_welcome_seen');
        const hasApiKey = localStorage.getItem('recipeApp_openai_key');
        
        // Show welcome modal if user hasn't seen it and doesn't have an API key
        if (!hasSeenWelcome && !hasApiKey) {
            setTimeout(() => {
                this.showWelcomeModal();
            }, 500); // Small delay for better UX
        }
    }

    showWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        localStorage.setItem('recipeApp_welcome_seen', 'true');
    }
}

// Global functions for modal interactions
function openSettings() {
    window.location.href = 'settings.html';
}

function closeWelcomeModal() {
    if (app) {
        app.closeWelcomeModal();
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RecipeApp();
    
    // Debug commands - you can run these in the browser console
    window.debugApp = {
        // Test API key
        testApiKey: () => {
            const key = localStorage.getItem('recipeApp_openai_key');
            console.log('API Key exists:', !!key, 'Length:', key ? key.length : 0);
        },
        
        // Test ingredients
        testIngredients: () => {
            console.log('Current ingredients:', app.ingredients);
        },
        
        // Test recipe generation
        testRecipeGeneration: () => {
            console.log('Testing recipe generation...');
            app.generateRecipes();
        },
        
        // Clear all data
        clearAllData: () => {
            localStorage.clear();
            location.reload();
        },
        
        // Show all localStorage
        showStorage: () => {
            console.log('All localStorage:', {
                ingredients: localStorage.getItem('recipeApp_ingredients'),
                recipes: localStorage.getItem('recipeApp_savedRecipes'),
                apiKey: localStorage.getItem('recipeApp_openai_key') ? 'EXISTS' : 'NOT FOUND'
            });
        }
    };
    
    console.log('🔧 Debug commands available: debugApp.testApiKey(), debugApp.testIngredients(), etc.');
});

 