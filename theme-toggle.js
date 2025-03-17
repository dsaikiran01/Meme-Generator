// Theme Toggle
const checkbox = document.getElementById("checkbox");
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Function to apply theme based on local storage or device preference
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // If user has explicitly set a theme preference
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            checkbox.checked = true;
        } else {
            document.body.classList.remove('dark');
            checkbox.checked = false;
        }
    } 
    // No saved preference, use device setting
    else {
        if (prefersDarkScheme.matches) {
            document.body.classList.add('dark');
            checkbox.checked = true;
        } else {
            document.body.classList.remove('dark');
            checkbox.checked = false;
        }
    }
}

// Event listener for checkbox changes
checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        document.body.classList.add("dark");
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem('theme', 'light');
    }
});

// Event listener for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
    // Only apply device preference if user hasn't set their own preference
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        if (e.matches) {
            document.body.classList.add('dark');
            checkbox.checked = true;
        } else {
            document.body.classList.remove('dark');
            checkbox.checked = false;
        }
    }
});

// Reset to system preference button
function createResetButton() {
    const navbar = document.querySelector('.theme-toggle');
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-theme-btn';
    resetButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
    resetButton.title = 'Reset to device theme';
    
    resetButton.addEventListener('click', () => {
        localStorage.removeItem('theme');
        applyTheme();
        
        // Show feedback
        const feedback = document.createElement('span');
        feedback.className = 'theme-feedback';
        feedback.textContent = 'Using device theme';
        navbar.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                navbar.removeChild(feedback);
            }, 500);
        }, 2000);
    });
    
    navbar.appendChild(resetButton);
}

// Add theme indicator
function addThemeStylesheet() {
    const style = document.createElement('style');
    style.textContent = `
        .reset-theme-btn {
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
            padding: 5px;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
        }
        
        .reset-theme-btn:hover {
            background-color: var(--input-border-color);
        }
        
        .theme-feedback {
            position: absolute;
            font-size: 12px;
            background-color: var(--navbar-bg);
            padding: 5px 10px;
            border-radius: 4px;
            box-shadow: 0 2px 5px var(--navbar-shadow);
            top: 45px;
            transition: opacity 0.5s;
        }
        
        @media (max-width: 768px) {
            .reset-theme-btn {
                margin-left: 5px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addThemeStylesheet();
    createResetButton();
    applyTheme();
});

// Also apply theme immediately in case the script loads after DOMContentLoaded
applyTheme();
