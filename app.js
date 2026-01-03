// Calendar App - Google Calendar Clone

// ============================================
// State & Constants
// ============================================
const STORAGE_KEY = 'calendar_events';
let currentDate = new Date();
let selectedDate = new Date();
let events = [];

// ============================================
// DOM Elements
// ============================================
const monthYearEl = document.getElementById('monthYear');
const calendarDaysEl = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const createBtn = document.getElementById('createBtn');

// Mini calendar
const miniMonthEl = document.getElementById('miniMonth');
const miniDaysEl = document.getElementById('miniDays');
const miniPrevBtn = document.getElementById('miniPrev');
const miniNextBtn = document.getElementById('miniNext');

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const eventForm = document.getElementById('eventForm');
const eventIdInput = document.getElementById('eventId');
const eventTitleInput = document.getElementById('eventTitle');
const eventDateInput = document.getElementById('eventDate');
const eventStartTimeInput = document.getElementById('eventStartTime');
const eventEndTimeInput = document.getElementById('eventEndTime');
const eventLocationInput = document.getElementById('eventLocation');
const eventDescInput = document.getElementById('eventDescription');
const dateDisplayEl = document.getElementById('dateDisplay');
const deleteBtn = document.getElementById('deleteBtn');
const closeModalBtn = document.getElementById('closeModal');
const titleError = document.getElementById('titleError');
const dateError = document.getElementById('dateError');

// Logo day
const logoDay = document.querySelector('.logo-day');

// ============================================
// localStorage Functions
// ============================================
function saveEvents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('Failed to save events:', e);
    }
}

function loadEvents() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            events = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load events:', e);
        events = [];
    }
}

// ============================================
// Date Utilities
// ============================================
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function formatMonthYear(date) {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function isToday(year, month, day) {
    const today = new Date();
    return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
    );
}

function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function formatDateString(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function getEventsForDate(dateString) {
    return events.filter(event => event.date === dateString);
}

// ============================================
// Main Calendar Rendering
// ============================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    monthYearEl.textContent = formatMonthYear(currentDate);

    // Update logo day
    if (logoDay) {
        logoDay.textContent = new Date().getDate();
    }

    // Clear calendar
    calendarDaysEl.innerHTML = '';

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayCell = createDayCell(year, month - 1, day, true);
        calendarDaysEl.appendChild(dayCell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(year, month, day, false);
        calendarDaysEl.appendChild(dayCell);
    }

    // Next month days (fill remaining cells)
    const totalCells = calendarDaysEl.children.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(year, month + 1, day, true);
        calendarDaysEl.appendChild(dayCell);
    }
}

function createDayCell(year, month, day, isOtherMonth) {
    // Normalize month/year for prev/next month overflow
    const date = new Date(year, month, day);
    const normalizedYear = date.getFullYear();
    const normalizedMonth = date.getMonth();
    const normalizedDay = date.getDate();

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';

    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }

    if (isToday(normalizedYear, normalizedMonth, normalizedDay)) {
        dayCell.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = normalizedDay;
    dayCell.appendChild(dayNumber);

    // Render events for this day
    const dateString = formatDateString(normalizedYear, normalizedMonth, normalizedDay);
    const dayEvents = getEventsForDate(dateString);

    dayEvents.forEach(event => {
        const eventChip = document.createElement('div');
        eventChip.className = 'event-chip';
        const timeStr = event.startTime ? formatTime12h(event.startTime) + ' ' : '';
        eventChip.textContent = timeStr + event.title;
        eventChip.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(event);
        });
        dayCell.appendChild(eventChip);
    });

    // Click to add event
    dayCell.addEventListener('click', () => {
        openAddModal(dateString);
    });

    return dayCell;
}

function formatTime12h(time24) {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

// ============================================
// Mini Calendar Rendering
// ============================================
function renderMiniCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    miniMonthEl.textContent = formatMonthYear(currentDate);
    miniDaysEl.innerHTML = '';

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createMiniDay(year, month - 1, day, true);
        miniDaysEl.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createMiniDay(year, month, day, false);
        miniDaysEl.appendChild(dayEl);
    }

    // Next month days
    const totalCells = miniDaysEl.children.length;
    const rows = Math.ceil(totalCells / 7);
    const targetCells = rows * 7;
    for (let day = 1; miniDaysEl.children.length < targetCells; day++) {
        const dayEl = createMiniDay(year, month + 1, day, true);
        miniDaysEl.appendChild(dayEl);
    }
}

function createMiniDay(year, month, day, isOtherMonth) {
    const date = new Date(year, month, day);
    const normalizedYear = date.getFullYear();
    const normalizedMonth = date.getMonth();
    const normalizedDay = date.getDate();

    const dayEl = document.createElement('div');
    dayEl.className = 'mini-day';
    dayEl.textContent = normalizedDay;

    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }

    if (isToday(normalizedYear, normalizedMonth, normalizedDay)) {
        dayEl.classList.add('today');
    }

    if (isSameDay(date, selectedDate)) {
        dayEl.classList.add('selected');
    }

    dayEl.addEventListener('click', () => {
        selectedDate = new Date(normalizedYear, normalizedMonth, normalizedDay);
        renderMiniCalendar();
    });

    return dayEl;
}

// ============================================
// Navigation
// ============================================
function navigateMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
    renderMiniCalendar();
}

function goToToday() {
    currentDate = new Date();
    selectedDate = new Date();
    renderCalendar();
    renderMiniCalendar();
}

// ============================================
// Event CRUD Operations
// ============================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function openAddModal(dateString) {
    eventForm.reset();
    eventIdInput.value = '';
    eventDateInput.value = dateString;
    dateDisplayEl.textContent = formatDisplayDate(dateString);
    eventStartTimeInput.value = '09:00';
    eventEndTimeInput.value = '10:00';
    deleteBtn.hidden = true;
    clearErrors();
    modalOverlay.hidden = false;
    eventTitleInput.focus();
}

function openEditModal(event) {
    eventIdInput.value = event.id;
    eventTitleInput.value = event.title;
    eventDateInput.value = event.date;
    dateDisplayEl.textContent = formatDisplayDate(event.date);
    eventStartTimeInput.value = event.startTime || '09:00';
    eventEndTimeInput.value = event.endTime || '10:00';
    eventLocationInput.value = event.location || '';
    eventDescInput.value = event.description || '';
    deleteBtn.hidden = false;
    clearErrors();
    modalOverlay.hidden = false;
    eventTitleInput.focus();
}

function closeModal() {
    modalOverlay.hidden = true;
    eventForm.reset();
    clearErrors();
}

function addEvent(eventData) {
    const newEvent = {
        id: generateId(),
        title: eventData.title,
        date: eventData.date,
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
        location: eventData.location || '',
        description: eventData.description || ''
    };
    events.push(newEvent);
    saveEvents();
    renderCalendar();
}

function updateEvent(eventData) {
    const index = events.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
        events[index] = {
            ...events[index],
            title: eventData.title,
            date: eventData.date,
            startTime: eventData.startTime || '',
            endTime: eventData.endTime || '',
            location: eventData.location || '',
            description: eventData.description || ''
        };
        saveEvents();
        renderCalendar();
    }
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        renderCalendar();
        closeModal();
    }
}

// ============================================
// Validation
// ============================================
function clearErrors() {
    titleError.textContent = '';
    dateError.textContent = '';
}

function validateForm() {
    let isValid = true;
    clearErrors();

    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;

    if (!title) {
        titleError.textContent = 'Title is required';
        isValid = false;
    }

    if (!date) {
        dateError.textContent = 'Date is required';
        isValid = false;
    }

    return isValid;
}

// ============================================
// Event Listeners
// ============================================
prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
nextMonthBtn.addEventListener('click', () => navigateMonth(1));
todayBtn.addEventListener('click', goToToday);

miniPrevBtn.addEventListener('click', () => navigateMonth(-1));
miniNextBtn.addEventListener('click', () => navigateMonth(1));

createBtn.addEventListener('click', () => {
    const today = new Date();
    const dateString = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
    openAddModal(dateString);
});

closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) {
        closeModal();
    }
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const eventData = {
        id: eventIdInput.value,
        title: eventTitleInput.value.trim(),
        date: eventDateInput.value,
        startTime: eventStartTimeInput.value,
        endTime: eventEndTimeInput.value,
        location: eventLocationInput.value.trim(),
        description: eventDescInput.value.trim()
    };

    if (eventData.id) {
        updateEvent(eventData);
    } else {
        addEvent(eventData);
    }

    closeModal();
});

deleteBtn.addEventListener('click', () => {
    const id = eventIdInput.value;
    if (id) {
        deleteEvent(id);
    }
});

// Clear errors on input
eventTitleInput.addEventListener('input', () => {
    if (eventTitleInput.value.trim()) {
        titleError.textContent = '';
    }
});

// ============================================
// Initialize
// ============================================
function init() {
    loadEvents();
    renderCalendar();
    renderMiniCalendar();
}

init();
