
let guests       = null;
let selectedTime = null;
let selectedDay  = null;
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
let _selMonth    = null;
let _selYear     = null;

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

// Calender
function renderCalendar() {
    document.getElementById('cal-month-label').textContent =
        MONTH_NAMES[currentMonth] + ' ' + currentYear;

    const grid      = document.getElementById('cal-grid');
    grid.innerHTML  = '';

    const firstDow   = new Date(currentYear, currentMonth, 1).getDay();
    const offset     = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today      = new Date();

    for (let i = 0; i < offset; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-day cal-blank';
        grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell     = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = d;

        const cellDate = new Date(currentYear, currentMonth, d);
        const todayFlat = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (cellDate < todayFlat) {
            cell.classList.add('cal-past');
        } else {
            cell.addEventListener('click', () => pickDay(d, cell));
        }

        if (selectedDay === d && _selMonth === currentMonth && _selYear === currentYear) {
            cell.classList.add('cal-active');
        }

        grid.appendChild(cell);
    }
}

function pickDay(d, cell) {
    selectedDay = d;
    _selMonth   = currentMonth;
    _selYear    = currentYear;
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

// Party size
function selectGuests(num, btn) {
    guests = num;
    document.querySelectorAll('.guest-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
}

function addGuest(btn) {
    guests = guests ? guests + 1 : 7;
    document.querySelectorAll('.guest-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
}

// Time
function selectTime(t, btn) {
    selectedTime = t;
    document.querySelectorAll('.time-btn:not(.time-disabled)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
}

// summary
function updateSummary() {
    document.getElementById('sum-date').textContent =
        (selectedDay && _selMonth !== null && _selYear !== null)
            ? MONTH_SHORT[_selMonth] + ' ' + selectedDay + ', ' + _selYear
            : '—';

    document.getElementById('sum-time').textContent =
        selectedTime || '—';

    document.getElementById('sum-guests').textContent =
        guests ? guests + (guests === 1 ? ' Guest' : ' Guests') : '—';
}

// Confirm Reservation
async function confirmReservation() {
    // Validate selections
    if (!guests || !selectedTime || !selectedDay) {
        alert('Please select a party size, date, and time before confirming.');
        return;
    }

    // redirect if not authenticated
    const user = getCurrentUser();   // from auth.js
    if (!user) {
      
        localStorage.setItem('mealea_redirect_after_login', 'reservation.html');
        alert('Please sign in to make a reservation.');
        window.location.href = 'login.html';
        return;
    }

    const formattedDate = `${_selYear}-${String(_selMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    const reservationData = {
        numberOfPeople:  parseInt(guests),
        time:            selectedTime,
        date:            formattedDate,
        specialRequests: ''
    };

    // Show loading state
    const btn    = document.getElementById('confirmBtn');
    const status = document.getElementById('confirm-status');
    btn.disabled      = true;
    btn.textContent   = 'Confirming…';
    status.style.display = 'block';
    status.textContent   = 'Sending your reservation…';

    try {
        //credentials sends the JWT cookie
        const response = await fetch('http://127.0.0.1:5000/api/reservations',  {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(reservationData)
        });

        const result = await response.json();

        if (response.ok) {

            localStorage.setItem('mealea_reservation', JSON.stringify(result));
            window.location.href = 'confirmation.html';

        } else if (response.status === 401) {
            // Token expired or missing 
            localStorage.removeItem('mealea_user');
            alert('Your session has expired. Please sign in again.');
            window.location.href = 'login.html';

        } else {
            status.textContent = '⚠️ ' + (result.message || 'Failed to book. Please try again.');
            btn.disabled     = false;
            btn.textContent  = 'Confirm Reservation →';
        }

    } catch (err) {
        console.error('Reservation error:', err);
        status.textContent = '⚠️ Could not connect to server. Is the backend running?';
        btn.disabled    = false;
        btn.textContent = 'Confirm Reservation →';
    }
}

renderCalendar();