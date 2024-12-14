let prevD = -1, prevH = -1, prevM = -1, prevS = -1;

function updateNumberStrip(elementId, number, prevNumber) {
    const strip = document.getElementById(elementId);
    if (!strip) return;

    // Chỉ cập nhật nếu số thay đổi
    if (number !== prevNumber) {
        const currentTop = -(number * 100); // Mỗi số cao 100px
        strip.style.transform = `translateY(${currentTop}px)`;
    }
}

function updateCountdown() {
    const newYear = new Date('January 1, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const gap = newYear - now;

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const d = Math.floor(gap / day);
    const h = Math.floor((gap % day) / hour);
    const m = Math.floor((gap % hour) / minute);
    const s = Math.floor((gap % minute) / second);

    // Cập nhật số và tạo hiệu ứng chuyển động
    updateNumberStrip('days-strip', d, prevD);
    updateNumberStrip('hours-strip', h, prevH);
    updateNumberStrip('minutes-strip', m, prevM);
    updateNumberStrip('seconds-strip', s, prevS);

    // Lưu giá trị hiện tại cho lần cập nhật tiếp theo
    prevD = d;
    prevH = h;
    prevM = m;
    prevS = s;

    // Tạo hiệu ứng chuyển động khi đơn vị lớn hơn thay đổi
    if (s === 59) {
        // Chuẩn bị cho phút tiếp theo
        setTimeout(() => {
            const strip = document.getElementById('minutes-strip');
            if (strip) {
                strip.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        }, 900);
    }
    if (m === 59 && s === 59) {
        // Chuẩn bị cho giờ tiếp theo
        setTimeout(() => {
            const strip = document.getElementById('hours-strip');
            if (strip) {
                strip.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        }, 900);
    }
    if (h === 23 && m === 59 && s === 59) {
        // Chuẩn bị cho ngày tiếp theo
        setTimeout(() => {
            const strip = document.getElementById('days-strip');
            if (strip) {
                strip.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        }, 900);
    }
}

// Khởi tạo các số trên strip
function initNumberStrips() {
    const strips = ['days-strip', 'hours-strip', 'minutes-strip', 'seconds-strip'];
    strips.forEach(stripId => {
        const strip = document.getElementById(stripId);
        if (strip) {
            // Tạo các số từ 0-99
            for (let i = 0; i <= 99; i++) {
                const numberDiv = document.createElement('div');
                numberDiv.className = 'number';
                numberDiv.textContent = i.toString().padStart(2, '0');
                strip.appendChild(numberDiv);
            }
        }
    });
}

export { updateCountdown, initNumberStrips };
