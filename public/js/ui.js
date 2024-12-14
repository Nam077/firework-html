// Modal functions
function openHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.style.display = 'block';
}

function closeHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.style.display = 'none';
}

// Khởi tạo UI
function initUI() {
    initModal();
    initUIToggle();
    const audioButton = document.querySelector('#audioButton');
    
    if (audioButton) {
        // Khôi phục trạng thái âm thanh từ localStorage
        const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
        audioButton.classList.toggle('active', audioEnabled);

        // Lưu trạng thái âm thanh vào localStorage khi thay đổi
        audioButton.addEventListener('click', () => {
            const isActive = audioButton.classList.toggle('active');
            localStorage.setItem('audioEnabled', isActive);
        });
    }
}

// Modal control
function initModal() {
    const modal = document.getElementById('helpModal');
    const closeBtn = document.querySelector('.close');
    const helpBtn = document.getElementById('helpButton');

    // Add click event for help button
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'block';
        });
    }

    // Close modal when clicking close button
    if (closeBtn) {
        closeBtn.onclick = closeHelp;
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            closeHelp();
        }
    }

    // Show help on first visit
    if (!localStorage.getItem('hasVisited')) {
        openHelp();
        localStorage.setItem('hasVisited', true);
    }
}

// UI Toggle control
function initUIToggle() {
    const toggleButton = document.getElementById('uiToggle');
    const countdown = document.getElementById('countdown');
    const controlsContainer = document.getElementById('controlsContainer');

    function toggleUI() {
        if (countdown) countdown.classList.toggle('hidden');
        if (controlsContainer) controlsContainer.classList.toggle('hidden');
    }

    if (toggleButton) {
        // Khôi phục trạng thái từ localStorage
        const uiState = localStorage.getItem('fireworksUIState');
        if (uiState !== null) {
            const isVisible = JSON.parse(uiState);
            toggleButton.checked = isVisible;
            if (!isVisible) {
                toggleUI();
            }
        }

        // Lưu trạng thái vào localStorage khi thay đổi
        toggleButton.addEventListener('change', (e) => {
            const isVisible = e.target.checked;
            localStorage.setItem('fireworksUIState', JSON.stringify(isVisible));
            toggleUI();
        });
    }
}

export { initUI, openHelp };
