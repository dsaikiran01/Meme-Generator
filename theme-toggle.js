const checkbox = document.getElementById("checkbox");

// check the stored theme
function applyStoredTheme() {
    const theme = localStorage.getItem('theme');

    if (theme === 'dark') {
        // check the checkbox and add dark class
        checkbox.checked = true;
        document.body.classList.add('dark');
    } else {
        // make sure checkbox is unchecked
        checkbox.checked = false;
        document.body.classList.remove('dark');
    }
}

// Apply theme based on preference in the device settings
// more friendly for dark mode users
function applyThemeBasedOnDevice(e) {
    if (localStorage.getItem('theme') === 'light') {
        if (e.matches) {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            checkbox.checked = true;
        } else {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
            localStorage.setItem('theme', 'light');
            checkbox.checked = false;
        }
    }
}

// Save theme in localStorage
checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        localStorage.setItem('theme', 'dark');
        document.body.classList.add("dark");
    } else {
        localStorage.setItem('theme', 'light');
        document.body.classList.remove("dark");
    }
});

// Apply the theme when the page loads
document.addEventListener('DOMContentLoaded', applyStoredTheme);

// Listen for changes in the system theme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => applyThemeBasedOnDevice(e));
