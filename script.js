class CrypticPuzzle {
    constructor(config = {}) {
        console.log('this.config', config);
        this.currentCell = 0;
        this.solution = config.solution || 'PORT';
        this.clue = config.clue || "Paddleboat's left side or its terminus!?";
        this.author = config.author || 'William Snow';
        this.date = config.date || '27 June, 2025';
        this.wordBreaks = config.wordBreaks || []; // Array of indices where spaces should appear
        this.videoUrl = config.videoUrl || null; // YouTube video URL for success
        
        // Create grid layout with spaces
        this.createGridLayout();
        
        // Initialize answer array based on solution length
        this.answer = new Array(this.solution.length).fill('');
        
        this.initializeGame();
        this.setupEventListeners();
    }

    createGridLayout() {
        // Create an array that includes both letters and spaces
        this.gridLayout = [];
        
        for (let i = 0; i < this.solution.length; i++) {
            // Add the letter cell
            this.gridLayout.push({ type: 'cell', solutionIndex: i });
            
            // Add space if this is a word break position
            if (this.wordBreaks.includes(i + 1)) {
                this.gridLayout.push({ type: 'space' });
            }
        }
    }

    initializeGame() {
        this.updatePageContent();
        this.updateGrid();
        this.updateProgress();
    }

    updatePageContent() {
        // Update clue text
        const clueElement = document.querySelector('.clue-text');
        if (clueElement) {
            clueElement.textContent = `${this.clue} (${this.solution.length})`;
        }
        
        // Update date and author
        const dateElement = document.querySelector('.date');
        const authorElement = document.querySelector('.author');
        if (dateElement) dateElement.textContent = this.date;
        if (authorElement) authorElement.textContent = `By ${this.author}`;
        
        // Update grid HTML to match solution length
        this.createGrid();
    }

    createGrid() {
        const gridContainer = document.querySelector('.grid');
        if (gridContainer) {
            gridContainer.innerHTML = '';
            let cellIndex = 0;
            
            this.gridLayout.forEach((item, index) => {
                if (item.type === 'space') {
                    const space = document.createElement('div');
                    space.className = 'grid-space';
                    gridContainer.appendChild(space);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.cellIndex = cellIndex;
                    cell.dataset.solutionIndex = item.solutionIndex;
                    gridContainer.appendChild(cell);
                    cellIndex++;
                }
            });
            
            // Setup event listeners after creating grid
            this.setupGridEventListeners();
        }
    }

    setupEventListeners() {
        // Keyboard event listeners
        const keys = document.querySelectorAll('.key:not(.backspace)');
        keys.forEach(key => {
            key.addEventListener('click', (e) => {
                this.handleKeyPress(e.target);
            });
        });

        // Keyboard event listeners
        const backspace = document.querySelectorAll('.backspace');
        backspace.forEach(key => {
            key.addEventListener('click', (e) => {
                this.handleBackspace();
            });
        });

        // Physical keyboard support - DISABLED to force custom keyboard use
        document.addEventListener('keydown', (e) => {
            // Prevent all keyboard input except special keys for accessibility
            if (e.key.match(/[a-zA-Z]/) || e.key === 'Backspace' || e.key === 'Enter') {
                e.preventDefault();
            }
        });

        // Action buttons
        const checkBtn = document.querySelector('.check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkAnswer();
            });
        }

        // Header buttons
        document.querySelector('.back-btn').addEventListener('click', () => {
            this.goBack();
        });

        document.querySelector('.info-btn').addEventListener('click', () => {
            this.showInfo();
        });

        document.querySelector('.menu-btn').addEventListener('click', () => {
            this.showMenu();
        });
    }

    setupGridEventListeners() {
        // Grid cell clicks - called after grid is created
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                const solutionIndex = parseInt(cell.dataset.solutionIndex);
                this.setCurrentCell(solutionIndex);
            });
        });
    }

    getNextCellIndex() {
        // Find next available cell index
        for (let i = this.currentCell + 1; i < this.solution.length; i++) {
            return i;
        }
        return this.currentCell;
    }

    getPrevCellIndex() {
        // Find previous available cell index
        for (let i = this.currentCell - 1; i >= 0; i--) {
            return i;
        }
        return this.currentCell;
    }

    handleKeyPress(keyElement) {
        console.log('keyElement.classList', keyElement.classList);
        if (keyElement.classList.contains('backspace')) {
            console.log('handling backspace');
            this.handleBackspace();
        } else {
            console.log('handleing other letter')
            const letter = keyElement.textContent;
            this.handleLetterInput(letter);
        }
    }

    handleLetterInput(letter) {
        console.log('Handling letter input:', letter);
        if (this.currentCell < this.solution.length) {
            this.answer[this.currentCell] = letter;
            this.updateGrid();
            this.updateProgress();
            
            // Move to next cell if not at the end
            if (this.currentCell < this.solution.length - 1) {
                this.currentCell++;
                this.updateGrid();
            }
        }
    }

    handleBackspace() {
        // If current cell has content, clear it and stay on the same cell
        if (this.answer[this.currentCell] !== '') {
            this.answer[this.currentCell] = '';
        } 
        // If current cell is empty, move back and clear the previous cell
        else if (this.currentCell > 0) {
            this.currentCell--;
            this.answer[this.currentCell] = '';
        }
        
        this.updateGrid();
        this.updateProgress();
    }

    setCurrentCell(index) {
        this.currentCell = index;
        this.updateGrid();
    }

    updateGrid() {
        const gridCells = document.querySelectorAll('.grid-cell');
        
        gridCells.forEach((cell, index) => {
            const solutionIndex = parseInt(cell.dataset.solutionIndex);
            
            // Clear classes
            cell.classList.remove('active', 'filled');
            
            // Add content based on solution index
            cell.textContent = this.answer[solutionIndex] || '';
            
            // Add appropriate classes - current cell is based on solution index
            if (solutionIndex === this.currentCell) {
                cell.classList.add('active');
            }
            
            if (this.answer[solutionIndex]) {
                cell.classList.add('filled');
            }
        });
    }

    updateProgress() {
        // Update check button state
        this.updateCheckButton();
    }

    updateCheckButton() {
        const checkBtn = document.querySelector('.check-btn');
        const filledCells = this.answer.filter(cell => cell !== '').length;
        const isComplete = filledCells === this.solution.length;
        
        if (checkBtn) {
            checkBtn.disabled = !isComplete;
            checkBtn.classList.toggle('enabled', isComplete);
            checkBtn.classList.toggle('disabled', !isComplete);
        }
    }

    checkAnswer() {
        const checkBtn = document.querySelector('.check-btn');
        if (checkBtn && checkBtn.disabled) {
            return; // Don't check if button is disabled
        }

        const userAnswer = this.answer.join('');
        
        if (userAnswer.length < this.solution.length) {
            this.showMessage('Please complete the word first!');
            return;
        }

        if (userAnswer === this.solution) {
            this.showSuccess();
        } else {
            this.showIncorrect();
        }
    }

    showHint() {
        const randomHint = this.hints[Math.floor(Math.random() * this.hints.length)];
        this.showMessage(randomHint);
    }

    showSuccess() {
        this.showMessage('Correct! 🎉', 'success');
        this.updateProgress();
        
        // Animate success
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.animation = 'bounce 0.6s ease';
            }, index * 100);
        });

        // Show YouTube video if available
        if (this.videoUrl) {
            console.log('Video URL found:', this.videoUrl); // Debug log
            setTimeout(() => {
                this.showVideo();
            }, 1000); // Wait 1 second after success message
        } else {
            console.log('No video URL configured'); // Debug log
        }
    }

    showVideo() {
        console.log('showVideo called with URL:', this.videoUrl); // Debug log
        
        // Convert YouTube URL to embed format
        const videoId = this.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (!videoId) {
            console.log('Failed to extract video ID from URL:', this.videoUrl);
            return;
        }
        
        console.log('Video ID extracted:', videoId[1]); // Debug log

        // Create video overlay
        const videoOverlay = document.createElement('div');
        videoOverlay.className = 'video-overlay';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => videoOverlay.remove();
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId[1]}?autoplay=1`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; encrypted-media';
        
        videoContainer.appendChild(closeBtn);
        videoContainer.appendChild(iframe);
        videoOverlay.appendChild(videoContainer);
        document.body.appendChild(videoOverlay);

        console.log('Video overlay added to DOM'); // Debug log

        // Style the video overlay
        Object.assign(videoOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: '2000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-in-out'
        });

        Object.assign(videoContainer.style, {
            position: 'relative',
            width: '90%',
            maxWidth: '800px',
            height: '60%',
            maxHeight: '450px',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
        });

        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: '2001',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
    }

    showIncorrect() {
        this.showMessage('Not quite right. Try again!', 'error');
        
        // Shake animation
        const grid = document.querySelector('.grid');
        grid.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            grid.style.animation = '';
        }, 500);
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: type === 'success' ? '#4CAF50' : 
                       type === 'error' ? '#f44336' : '#2196F3',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '500',
            zIndex: '1000',
            animation: 'fadeInOut 2s ease-in-out'
        });
        
        document.body.appendChild(messageEl);
        
        // Remove message after animation
        setTimeout(() => {
            messageEl.remove();
        }, 2000);
    }

    goBack() {
        // Navigate back to the puzzle selection page
        window.location.href = 'index.html';
    }

    showInfo() {
        this.showMessage('Les pistes tenen dues parts, la defició i el joc de paraules!');
    }

    showMenu() {
        console.log('Opening menu...');
        // Implement menu logic
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if there's a global puzzle config
    if (typeof window.puzzleConfig !== 'undefined') {
        new CrypticPuzzle(window.puzzleConfig);
    } else {
        // Default puzzle
        new CrypticPuzzle();
    }
});

// Prevent zooming on mobile
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
