// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Search elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const cocktailGallery = document.getElementById('cocktail-gallery');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Detail view elements
    const cocktailDetail = document.getElementById('cocktail-detail');
    const detailContent = document.getElementById('detail-content');
    const backBtn = document.getElementById('back-btn');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    
    // Favorites elements
    const favoritesList = document.getElementById('favorites-list');
    
    // Form elements
    const signupForm = document.getElementById('signup-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');
    
    // Secret modal elements
    const secretModal = document.getElementById('secret-modal');
    const secretRecipe = document.getElementById('secret-recipe');
    const closeBtn = document.querySelector('.close-btn');
    
    // Application state
    let currentCocktails = [];
    let currentPage = 0;
    let itemsPerPage = 4;
    let currentCocktail = null;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // =============================
    // 1. EVENT HANDLING SECTION
    // =============================
    
    // Tab click event
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Button click event
    searchBtn.addEventListener('click', searchCocktails);
    
    // Hover effects
    searchBtn.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    searchBtn.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Keypress detection
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCocktails();
        }
    });
    
    // BONUS: Secret action for double-click
    document.addEventListener('dblclick', showSecretCocktail);
    
    // BONUS: Long press detection (mobile friendly)
    let pressTimer;
    document.addEventListener('mousedown', function() {
        pressTimer = window.setTimeout(showSecretCocktail, 1500);
    });
    
    document.addEventListener('mouseup', function() {
        clearTimeout(pressTimer);
    });
    
    document.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer);
    });
    
    // Close secret modal
    closeBtn.addEventListener('click', function() {
        secretModal.classList.add('hidden');
    });
    
    // ESC key to clear search
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            cocktailGallery.innerHTML = '';
            cocktailDetail.classList.add('hidden');
        }
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            renderGallery();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if ((currentPage + 1) * itemsPerPage < currentCocktails.length) {
            currentPage++;
            renderGallery();
        }
    });
    
    // Back button in detail view
    backBtn.addEventListener('click', function() {
        cocktailDetail.classList.add('hidden');
        cocktailGallery.parentElement.classList.remove('hidden');
    });
    
    // Save to favorites
    saveFavoriteBtn.addEventListener('click', function() {
        if (currentCocktail) {
            // Check if already in favorites
            if (!favorites.some(fav => fav.idDrink === currentCocktail.idDrink)) {
                favorites.push(currentCocktail);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                // Visual feedback
                saveFavoriteBtn.textContent = 'Added to Favorites!';
                saveFavoriteBtn.style.backgroundColor = '#27ae60';
                
                // Reset button after delay
                setTimeout(() => {
                    saveFavoriteBtn.textContent = 'Add to Favorites';
                    saveFavoriteBtn.style.backgroundColor = '#f39c12';
                }, 2000);
                
                // Update favorites display if visible
                renderFavorites();
            } else {
                saveFavoriteBtn.textContent = 'Already in Favorites';
                setTimeout(() => {
                    saveFavoriteBtn.textContent = 'Add to Favorites';
                }, 2000);
            }
        }
    });
    
    // =============================
    // 2. INTERACTIVE ELEMENTS SECTION
    // =============================
    
    // Function to search cocktails
    function searchCocktails() {
        const query = searchInput.value.trim();
        if (!query) return;
        
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.drinks) {
                    currentCocktails = data.drinks;
                    currentPage = 0;
                    renderGallery();
                    cocktailDetail.classList.add('hidden');
                    cocktailGallery.parentElement.classList.remove('hidden');
                } else {
                    cocktailGallery.innerHTML = '<p class="empty-message">No cocktails found. Try another search!</p>';
                    prevBtn.style.visibility = 'hidden';
                    nextBtn.style.visibility = 'hidden';
                }
            })
            .catch(error => {
                console.error('Error fetching cocktails:', error);
                cocktailGallery.innerHTML = '<p class="empty-message">Something went wrong. Please try again.</p>';
            });
    }
    
    // Render gallery of cocktails
    function renderGallery() {
        cocktailGallery.innerHTML = '';
        
        // Calculate pagination
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, currentCocktails.length);
        
        // Update navigation buttons
        prevBtn.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = end < currentCocktails.length ? 'visible' : 'hidden';
        
        // Create cocktail cards
        for (let i = start; i < end; i++) {
            const cocktail = currentCocktails[i];
            const card = document.createElement('div');
            card.className = 'cocktail-card';
            card.innerHTML = `
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                <div class="card-content">
                    <h3>${cocktail.strDrink}</h3>
                    <p>${cocktail.strAlcoholic}</p>
                </div>
            `;
            
            // Card click event to show details
            card.addEventListener('click', () => showCocktailDetails(cocktail));
            
            cocktailGallery.appendChild(card);
        }
    }
    
    // Show cocktail details
    function showCocktailDetails(cocktail) {
        currentCocktail = cocktail;
        
        // Get ingredients
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = cocktail[`strIngredient${i}`];
            const measure = cocktail[`strMeasure${i}`];
            
            if (ingredient) {
                ingredients.push(`${measure || ''} ${ingredient}`);
            }
        }
        
        // Build detail content
        detailContent.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" 
                     style="width: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div>
                    <h2>${cocktail.strDrink}</h2>
                    <p><strong>Category:</strong> ${cocktail.strCategory}</p>
                    <p><strong>Type:</strong> ${cocktail.strAlcoholic}</p>
                    <p><strong>Glass:</strong> ${cocktail.strGlass}</p>
                </div>
            </div>
            
            <div>
                <h3>Ingredients:</h3>
                <ul style="list-style-position: inside; margin-bottom: 15px;">
                    ${ingredients.map(ing => `<li>${ing.trim()}</li>`).join('')}
                </ul>
                
                <h3>Instructions:</h3>
                <p>${cocktail.strInstructions}</p>
            </div>
        `;
        
        // Update save button text based on favorite status
        const isFavorite = favorites.some(fav => fav.idDrink === cocktail.idDrink);
        saveFavoriteBtn.textContent = isFavorite ? 'Already in Favorites' : 'Add to Favorites';
        saveFavoriteBtn.style.backgroundColor = isFavorite ? '#7f8c8d' : '#f39c12';
        
        // Show detail view, hide gallery
        cocktailDetail.classList.remove('hidden');
        cocktailGallery.parentElement.classList.add('hidden');
    }
    
    // Show secret cocktail
    function showSecretCocktail() {
        fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
            .then(response => response.json())
            .then(data => {
                if (data.drinks && data.drinks[0]) {
                    const secretDrink = data.drinks[0];
                    
                    // Get ingredients for secret recipe
                    const ingredients = [];
                    for (let i = 1; i <= 15; i++) {
                        const ingredient = secretDrink[`strIngredient${i}`];
                        const measure = secretDrink[`strMeasure${i}`];
                        
                        if (ingredient) {
                            ingredients.push(`${measure || ''} ${ingredient}`);
                        }
                    }
                    
                    // Build secret recipe content
                    secretRecipe.innerHTML = `
                        <div style="text-align: center; margin-bottom: 15px;">
                            <img src="${secretDrink.strDrinkThumb}" alt="${secretDrink.strDrink}" 
                                style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
                            <h3>${secretDrink.strDrink}</h3>
                        </div>
                        
                        <h4>Ingredients:</h4>
                        <ul style="list-style-position: inside; margin-bottom: 15px;">
                            ${ingredients.map(ing => `<li>${ing.trim()}</li>`).join('')}
                        </ul>
                        
                        <h4>Instructions:</h4>
                        <p>${secretDrink.strInstructions}</p>
                    `;
                    
                    // Show the modal with animation
                    secretModal.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error fetching secret recipe:', error);
            });
    }
    
    // Render favorites
    function renderFavorites() {
        if (favorites.length > 0) {
            favoritesList.innerHTML = '';
            
            favorites.forEach(cocktail => {
                const favCard = document.createElement('div');
                favCard.className = 'cocktail-card';
                favCard.innerHTML = `
                    <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                    <div class="card-content">
                        <h3>${cocktail.strDrink}</h3>
                        <button class="remove-btn" data-id="${cocktail.idDrink}">Remove</button>
                    </div>
                `;
                
                // Card click to show details
                favCard.querySelector('img').addEventListener('click', () => {
                    // Switch to search tab first
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));
                    
                    document.querySelector('[data-tab="search"]').classList.add('active');
                    document.getElementById('search').classList.add('active');
                    
                    // Show cocktail details
                    showCocktailDetails(cocktail);
                });
                
                // Remove from favorites
                favCard.querySelector('.remove-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    favorites = favorites.filter(fav => fav.idDrink !== id);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    renderFavorites();
                });
                
                favoritesList.appendChild(favCard);
            });
        } else {
            favoritesList.innerHTML = '<p class="empty-message">You haven\'t saved any favorites yet.</p>';
        }
    }
    
    // =============================
    // 3. FORM VALIDATION SECTION
    // =============================
    
    // Real-time password validation
    passwordInput.addEventListener('input', validatePassword);
    
    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const isFullnameValid = validateFullname();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        // If all validations pass
        if (isFullnameValid && isEmailValid && isPasswordValid) {
            // Check if password meets all requirements
            const password = passwordInput.value;
            if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
                // Show success message
                signupForm.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h3 style="color: #27ae60;">Account Created Successfully!</h3>
                        <p>Thank you for signing up, ${fullnameInput.value}!</p>
                        <p>You can now use your email and password to log in.</p>
                    </div>
                `;
            } else {
                // Show specific password error
                document.getElementById('password-error').textContent = 'Please meet all password requirements';
            }
        }
    });
    
    // Name validation
    fullnameInput.addEventListener('blur', validateFullname);
    
    function validateFullname() {
        const fullname = fullnameInput.value.trim();
        const fullnameError = document.getElementById('fullname-error');
        
        if (fullname === '') {
            fullnameError.textContent = 'Full name is required';
            return false;
        }
        
        if (fullname.length < 2) {
            fullnameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        
        fullnameError.textContent = '';
        return true;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        // Check length
        if (password.length >= 8) {
            lengthCheck.classList.add('valid');
        } else {
            lengthCheck.classList.remove('valid');
        }
        
        // Check uppercase
        if (/[A-Z]/.test(password)) {
            uppercaseCheck.classList.add('valid');
        } else {
            uppercaseCheck.classList.remove('valid');
        }
        
        // Check number
        if (/\d/.test(password)) {
            numberCheck.classList.add('valid');
        } else {
            numberCheck.classList.remove('valid');
        }
    }
    
    // Email validation
    emailInput.addEventListener('blur', validateEmail);
    emailInput.addEventListener('input', function() {
        // Clear error message when user starts typing again
        document.getElementById('email-error').textContent = '';
    });
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById('email-error');
        
        if (email === '') {
            emailError.textContent = 'Email is required';
            return false;
        }
        
        // Simple email regex - for more comprehensive validation, use a library
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        
        emailError.textContent = '';
        return true;
