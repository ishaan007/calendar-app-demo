// Calendar App - Main Application Logic

// ============================================
// State & Constants
// ============================================
const STORAGE_KEY = 'calendar_events';
let currentDate = new Date();
let events = [];

// ============================================
// DOM Elements
// ============================================
const monthYearEl = document.getElementById('monthYear');
const calendarDaysEl = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const eventForm = document.getElementById('eventForm');
const eventIdInput = document.getElementById('eventId');
const eventTitleInput = document.getElementById('eventTitle');
const eventDateInput = document.getElementById('eventDate');
const eventTimeInput = document.getElementById('eventTime');
const eventDescInput = document.getElementById('eventDescription');
const deleteBtn = document.getElementById('deleteBtn');
const closeModalBtn = document.getElementById('closeModal');
const titleError = document.getElementById('titleError');
const dateError = document.getElementById('dateError');

// ============================================
// localStorage Functions (Task 5)
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
// Calendar Rendering (Task 3)
// ============================================
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function formatMonthYear(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isToday(year, month, day) {
    const today = new Date();
    return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
    );
}

function formatDateString(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function getEventsForDate(dateString) {
    return events.filter(event => event.date === dateString);
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    monthYearEl.textContent = formatMonthYear(currentDate);

    // Clear calendar
    calendarDaysEl.innerHTML = '';

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        calendarDaysEl.appendChild(emptyCell);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';

        if (isToday(year, month, day)) {
            dayCell.classList.add('today');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        // Render events for this day
        const dateString = formatDateString(year, month, day);
        const dayEvents = getEventsForDate(dateString);

        dayEvents.forEach(event => {
            const eventChip = document.createElement('div');
            eventChip.className = 'event-chip';
            eventChip.textContent = event.time ? `${event.time} ${event.title}` : event.title;
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

        calendarDaysEl.appendChild(dayCell);
    }
}

function navigateMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

// ============================================
// Event CRUD Operations (Task 4)
// ============================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function openAddModal(dateString) {
    modalTitle.textContent = 'Add Event';
    eventForm.reset();
    eventIdInput.value = '';
    eventDateInput.value = dateString;
    deleteBtn.hidden = true;
    clearErrors();
    modalOverlay.hidden = false;
    eventTitleInput.focus();
}

function openEditModal(event) {
    modalTitle.textContent = 'Edit Event';
    eventIdInput.value = event.id;
    eventTitleInput.value = event.title;
    eventDateInput.value = event.date;
    eventTimeInput.value = event.time || '';
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
        time: eventData.time || '',
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
            time: eventData.time || '',
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
// Validation (Task 6)
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
        time: eventTimeInput.value,
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

eventDateInput.addEventListener('change', () => {
    if (eventDateInput.value) {
        dateError.textContent = '';
    }
});

// ============================================
// Initialize
// ============================================
function init() {
    loadEvents();
    renderCalendar();
}

init();
