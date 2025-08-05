class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadApiKey();
        this.loadApiMode();
        this.updateStorageInfo();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // API Key management
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('testApiKey').addEventListener('click', () => this.testApiKey());
        document.getElementById('clearApiKey').addEventListener('click', () => this.clearApiKey());
        document.getElementById('togglePassword').addEventListener('click', () => this.togglePasswordVisibility());

        // API Mode toggle
        document.getElementById('apiModeToggle').addEventListener('change', () => this.toggleApiMode());

        // Data management
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importData').addEventListener('click', () => this.importData());
        document.getElementById('clearAllData').addEventListener('click', () => this.clearAllData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleFileImport(e));

        // Enter key to save
        document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
    }

    loadApiKey() {
        const apiKey = localStorage.getItem('recipeApp_openai_key');
        if (apiKey) {
            document.getElementById('apiKeyInput').value = apiKey;
            this.updateApiStatus('API key loaded from storage', 'success');
        } else {
            this.updateApiStatus('No API key found. Please enter your OpenAI API key.', 'info');
        }
    }

    loadApiMode() {
        // Default to proxy mode (true)
        const useProxy = localStorage.getItem('recipeApp_use_proxy') !== 'false';
        const toggle = document.getElementById('apiModeToggle');
        const label = document.getElementById('toggleLabel');
        const description = document.getElementById('modeDescription');
        
        toggle.checked = useProxy;
        this.updateApiModeUI(useProxy);
    }

    toggleApiMode() {
        const toggle = document.getElementById('apiModeToggle');
        const useProxy = toggle.checked;
        
        localStorage.setItem('recipeApp_use_proxy', useProxy.toString());
        this.updateApiModeUI(useProxy);
        
        const modeText = useProxy ? 'proxy' : 'direct API';
        this.showToast(`Switched to ${modeText} mode`, 'success');
    }

    updateApiModeUI(useProxy) {
        const label = document.getElementById('toggleLabel');
        const description = document.getElementById('modeDescription');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        if (useProxy) {
            label.textContent = 'Use API Proxy';
            description.textContent = 'Use the API proxy for requests (no API key required)';
            apiKeyInput.disabled = true;
            apiKeyInput.placeholder = 'Not needed with proxy';
        } else {
            label.textContent = 'Use Direct API';
            description.textContent = 'Use your own OpenAI API key for direct requests';
            apiKeyInput.disabled = false;
            apiKeyInput.placeholder = 'sk-...';
        }
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const useProxy = localStorage.getItem('recipeApp_use_proxy') !== 'false';
        
        if (useProxy) {
            this.showToast('API key not needed when using proxy mode', 'info');
            return;
        }
        
        if (!apiKey) {
            this.showToast('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            this.showToast('Please enter a valid OpenAI API key (should start with sk-)', 'error');
            return;
        }

        // Save to localStorage
        localStorage.setItem('recipeApp_openai_key', apiKey);
        
        this.showToast('API key saved successfully!', 'success');
        this.updateApiStatus('API key saved successfully', 'success');
    }

    async testApiKey() {
        const useProxy = localStorage.getItem('recipeApp_use_proxy') !== 'false';
        
        if (useProxy) {
            await this.testProxyConnection();
        } else {
            await this.testDirectApiConnection();
        }
    }

    async testDirectApiConnection() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            this.showToast('Please enter an API key first', 'error');
            return;
        }

        this.updateApiStatus('Testing direct API connection...', 'info');

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                this.showToast('Direct API connection successful!', 'success');
                this.updateApiStatus('✅ Direct API connection successful', 'success');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Direct API test error:', error);
            this.showToast('Direct API connection failed. Please check your key.', 'error');
            this.updateApiStatus('❌ Direct API connection failed: ' + error.message, 'error');
        }
    }

    async testProxyConnection() {
        this.updateApiStatus('Testing proxy connection...', 'info');

        try {
            const response = await fetch('https://openai-proxy.andy-parka.workers.dev/v1/models', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showToast('Proxy connection successful!', 'success');
                this.updateApiStatus('✅ Proxy connection successful', 'success');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Proxy test error:', error);
            this.showToast('Proxy connection failed. Please try again later.', 'error');
            this.updateApiStatus('❌ Proxy connection failed: ' + error.message, 'error');
        }
    }

    clearApiKey() {
        const useProxy = localStorage.getItem('recipeApp_use_proxy') !== 'false';
        
        if (useProxy) {
            this.showToast('API key not needed when using proxy mode', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear your API key? This will disable recipe generation.')) {
            localStorage.removeItem('recipeApp_openai_key');
            document.getElementById('apiKeyInput').value = '';
            this.showToast('API key cleared', 'success');
            this.updateApiStatus('API key cleared', 'info');
        }
    }

    togglePasswordVisibility() {
        const input = document.getElementById('apiKeyInput');
        const toggleBtn = document.getElementById('togglePassword');
        const icon = toggleBtn.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    exportData() {
        const data = {
            ingredients: JSON.parse(localStorage.getItem('recipeApp_ingredients') || '[]'),
            savedRecipes: JSON.parse(localStorage.getItem('recipeApp_savedRecipes') || '[]'),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipe-app-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate the data structure
                if (!data.ingredients || !data.savedRecipes) {
                    throw new Error('Invalid data format');
                }

                // Import the data
                localStorage.setItem('recipeApp_ingredients', JSON.stringify(data.ingredients));
                localStorage.setItem('recipeApp_savedRecipes', JSON.stringify(data.savedRecipes));

                this.showToast('Data imported successfully!', 'success');
                this.updateStorageInfo();

                // Clear the file input
                event.target.value = '';

            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will remove all saved ingredients and recipes. This action cannot be undone.')) {
            localStorage.removeItem('recipeApp_ingredients');
            localStorage.removeItem('recipeApp_savedRecipes');
            localStorage.removeItem('recipeApp_openai_key');
            localStorage.removeItem('recipeApp_use_proxy');
            
            document.getElementById('apiKeyInput').value = '';
            
            // Reset to default proxy mode
            const toggle = document.getElementById('apiModeToggle');
            toggle.checked = true;
            this.updateApiModeUI(true);
            
            this.showToast('All data cleared successfully', 'success');
            this.updateApiStatus('All data cleared', 'info');
            this.updateStorageInfo();
        }
    }

    updateStorageInfo() {
        const ingredients = JSON.parse(localStorage.getItem('recipeApp_ingredients') || '[]');
        const savedRecipes = JSON.parse(localStorage.getItem('recipeApp_savedRecipes') || '[]');
        
        document.getElementById('savedIngredientsCount').textContent = ingredients.length;
        document.getElementById('savedRecipesCount').textContent = savedRecipes.length;
        
        // Calculate storage usage
        const totalSize = new Blob([
            localStorage.getItem('recipeApp_ingredients') || '',
            localStorage.getItem('recipeApp_savedRecipes') || '',
            localStorage.getItem('recipeApp_openai_key') || ''
        ]).size;
        
        const sizeInKB = (totalSize / 1024).toFixed(2);
        document.getElementById('storageUsed').textContent = `${sizeInKB} KB`;
    }

    updateApiStatus(message, type) {
        const statusDiv = document.getElementById('apiStatus');
        statusDiv.textContent = message;
        statusDiv.className = `api-status ${type}`;
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
}

// Initialize settings when page loads
let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
}); 