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
