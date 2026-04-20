let guests = null;
let selectedTime = null;
let selectedDay = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Calendar ──────────────────────────────────────────────
function renderCalendar() {
    document.getElementById('cal-month-label').textContent =
        MONTH_NAMES[currentMonth] + ' ' + currentYear;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    const firstDow = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    // blank cells for offset
    for (let i = 0; i < offset; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-day cal-blank';
        grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = d;

        const cellDate = new Date(currentYear, currentMonth, d);
        if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            cell.classList.add('cal-past');
        } else {
            cell.addEventListener('click', () => pickDay(d, cell));
        }

        if (selectedDay === d && currentMonth === _selMonth && currentYear === _selYear) {
            cell.classList.add('cal-active');
        }

        grid.appendChild(cell);
    }
}

let _selMonth = null, _selYear = null;

function pickDay(d, cell) {
    selectedDay = d;
    _selMonth = currentMonth;
    _selYear = currentYear;
    document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('cal-active'));
    cell.classList.add('cal-active');
    updateSummary();
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    renderCalendar();
}

// ── Party Size ────────────────────────────────────────────
function selectGuests(num, btn) {
    guests = num;
    document.querySelectorAll('.guest-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
}
function addGuest(btn) {
    if (!guests) {
        guests = 6; // start from 6 if nothing selected
    }

    guests++; // increase by 1

    // remove active from all number buttons
    document.querySelectorAll('.guest-btn').forEach(b => b.classList.remove('active'));

    // highlight + button
    btn.classList.add('active');

    updateSummary();
}

// ── Time ─────────────────────────────────────────────────
function selectTime(t, btn) {
    selectedTime = t;
    document.querySelectorAll('.time-btn:not(.time-disabled)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
}

// ── Summary ───────────────────────────────────────────────
function updateSummary() {
    if (selectedDay && _selMonth !== null) {
        document.getElementById('sum-date').textContent =
            MONTH_SHORT[_selMonth] + ' ' + selectedDay + ', ' + _selYear;
    }
    document.getElementById('sum-time').textContent   = selectedTime || '—';
    document.getElementById('sum-guests').textContent = guests ? guests + (guests === 1 ? ' Guest' : ' Guests') : '—';
}

// ── Confirm ───────────────────────────────────────────────
// function confirmReservation() {
//     if (!guests || !selectedTime || !selectedDay) {
//         alert('Please select party size, date, and time.');
//         return;
//     }
//     const reservation = { guests, time: selectedTime, date: document.getElementById('sum-date').textContent };
//     localStorage.setItem('mealea_reservation', JSON.stringify(reservation));
//     alert('✅ Reservation Confirmed!\n\n' +
//           reservation.date + ' at ' + reservation.time + '\n' +
//           reservation.guests + (reservation.guests === 1 ? ' Guest' : ' Guests'));
// }
function confirmReservation() {
    if (!guests || !selectedTime || !selectedDay) {
        alert('Please select party size, date, and time.');
        return;
    }

    const reservation = {
        guests,
        time: selectedTime,
        date: document.getElementById('sum-date').textContent,
        email: "user@example.com" // 🔥 replace later with real input
    };

    // Save to localStorage
    localStorage.setItem('mealea_reservation', JSON.stringify(reservation));

    // 🔥 SEND TO BACKEND (Node.js)
    fetch('http://localhost:3000/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
    });

    // 👉 REDIRECT
    window.location.href = "confirmation.html";
}

renderCalendar();