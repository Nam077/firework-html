// Khởi tạo các dải số
function initNumberStrip(id, maxNum = 9) {
    const strip = document.getElementById(id);
    strip.innerHTML = '';
    
    for (let i = 0; i < maxNum * 4; i++) {
        const number = i % maxNum;
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = number.toString().padStart(2, '0');
        div.style.transform = `translateY(${i * -100}px)`;
        strip.appendChild(div);
    }
    
    strip.style.transform = 'translateY(0)';
    return strip;
}

const strips = {
    days: initNumberStrip('days-strip', 100),
    hours: initNumberStrip('hours-strip', 24),
    minutes: initNumberStrip('minutes-strip', 60),
    seconds: initNumberStrip('seconds-strip', 60)
};

let previousValues = {
    days: -1,
    hours: -1,
    minutes: -1,
    seconds: -1
};

function calculateTimeLeft() {
    // Lấy thời gian hiện tại
    const now = new Date();
    
    // Tạo thời điểm năm mới theo múi giờ hiện tại
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;
    const newYear = new Date(nextYear, 0, 1, 0, 0, 0, 0);
    
    // Tính khoảng cách thời gian tính bằng milliseconds
    const timeDiff = newYear.getTime() - now.getTime();
    
    // Chuyển đổi sang các đơn vị thời gian
    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    
    const totalSeconds = Math.floor(timeDiff / MILLISECONDS_PER_SECOND);
    const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const days = Math.floor(totalHours / HOURS_PER_DAY);
    
    const hours = totalHours % HOURS_PER_DAY;
    const minutes = totalMinutes % MINUTES_PER_HOUR;
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}

function updateStrip(strip, value, previousValue) {
    if (previousValue !== value) {
        strip.style.transform = `translateY(${value * 100}px)`;
        strip.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    }
}

function updateCountdown() {
    const timeLeft = calculateTimeLeft();

    updateStrip(strips.days, timeLeft.days, previousValues.days);
    updateStrip(strips.hours, timeLeft.hours, previousValues.hours);
    updateStrip(strips.minutes, timeLeft.minutes, previousValues.minutes);
    updateStrip(strips.seconds, timeLeft.seconds, previousValues.seconds);

    previousValues = { ...timeLeft };

    if (timeLeft.days === 0 && timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        document.getElementById('countdown').style.display = 'none';
    }
}

// Khởi tạo countdown
function initCountdown() {
    // Cập nhật countdown mỗi giây
    setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Export các hàm cần thiết
export { initCountdown };
