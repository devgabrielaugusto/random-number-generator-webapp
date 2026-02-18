document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const numberDisplay = document.getElementById('numberDisplay');
    const historyList = document.getElementById('historyList');
    const timerDisplay = document.getElementById('timerDisplay');

    // Inputs
    const minInput = document.getElementById('minInput');
    const maxInput = document.getElementById('maxInput');
    const intervalInput = document.getElementById('intervalInput');

    let intervalId = null;
    let nextGenerationTime = null;
    let timerIntervalId = null;
    let isRunning = false;

    startButton.addEventListener('click', toggleGeneration);

    // Sidebar Toggle Logic
    const historyPanel = document.getElementById('historyPanel');
    const sidebarToggle = document.getElementById('sidebarToggle');

    sidebarToggle.addEventListener('click', () => {
        historyPanel.classList.toggle('collapsed');
    });

    function toggleGeneration() {
        if (isRunning) {
            stopGeneration();
        } else {
            startGeneration();
        }
    }

    function startGeneration() {
        const min = parseInt(minInput.value);
        const max = parseInt(maxInput.value);
        const intervalMinutes = parseFloat(intervalInput.value);

        if (isNaN(min) || isNaN(max) || isNaN(intervalMinutes)) {
            alert("Please enter valid numbers.");
            return;
        }

        if (min >= max) {
            alert("Min must be less than Max.");
            return;
        }

        if (intervalMinutes <= 0) {
            alert("Interval must be greater than 0.");
            return;
        }

        // Convert minutes to milliseconds
        const intervalMs = intervalMinutes * 60 * 1000;

        isRunning = true;
        startButton.textContent = "STOP";
        startButton.classList.add('running');

        // Disable inputs while running
        minInput.disabled = true;
        maxInput.disabled = true;
        intervalInput.disabled = true;

        // Remove empty state if present
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Generate immediately
        generateAndRecord(min, max, intervalMs);

        // Schedule next generations
        intervalId = setInterval(() => {
            generateAndRecord(min, max, intervalMs);
        }, intervalMs);
    }

    function stopGeneration() {
        isRunning = false;
        startButton.textContent = "START";
        startButton.classList.remove('running');

        clearInterval(intervalId);
        clearInterval(timerIntervalId);

        timerDisplay.textContent = "Stopped"; // Or "Waiting to start..."

        // Re-enable inputs
        minInput.disabled = false;
        maxInput.disabled = false;
        intervalInput.disabled = false;

        intervalId = null;
        timerIntervalId = null;
    }

    function generateAndRecord(min, max, intervalMs) {
        // 1. Generate random number between min and max
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

        // 2. Update display
        const currentVal = parseInt(numberDisplay.innerText.replace(/,/g, '')) || 0;
        // Don't animate if the jump is huge or if it's the first run? 
        // Animation is nice, let's keep it but ensure it handles negative numbers if user inputs them?
        animateValue(numberDisplay, currentVal, randomNum, 1000);

        // 3. Add to history
        addHistoryItem(randomNum);

        // 4. Reset Timer display for next cycle
        startCountdown(intervalMs);
    }

    function addHistoryItem(number) {
        const now = new Date();

        // Formatting date and time
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const dateStr = now.toLocaleDateString(undefined, dateOptions);
        const timeStr = now.toLocaleTimeString(undefined, timeOptions);

        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-number">${number.toLocaleString()}</div>
            <div class="history-meta">
                <span>${timeStr}</span>
                <span>${dateStr}</span>
            </div>
        `;

        // Prepend to list (showing newest first)
        historyList.insertBefore(item, historyList.firstChild);
    }

    function startCountdown(intervalMs) {
        if (timerIntervalId) clearInterval(timerIntervalId);

        nextGenerationTime = Date.now() + intervalMs;

        updateTimerDisplay();

        timerIntervalId = setInterval(updateTimerDisplay, 1000);
    }

    function updateTimerDisplay() {
        const now = Date.now();
        const diff = nextGenerationTime - now;

        if (diff <= 0) {
            timerDisplay.textContent = "Generating...";
            return;
        }

        // Format
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let timeString = "";
        if (hours > 0) {
            timeString += `${hours.toString().padStart(2, '0')}:`;
        }
        timeString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        timerDisplay.textContent = `Next update in ${timeString}`;
    }

    // Animation effect for the number change
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Linear interpolation
            const currentValue = Math.floor(progress * (end - start) + start);
            obj.innerHTML = currentValue.toLocaleString();

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString(); // Ensure final value is exact
            }
        };
        window.requestAnimationFrame(step);
    }
});
