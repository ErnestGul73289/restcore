(() => {
    const exerciseInput = document.getElementById('exercise-input');
    const addExerciseButton = document.getElementById('add-btn');
    const catalogSelect = document.getElementById('catalog-exercise');
    const addCatalogButton = document.getElementById('add-catalog-btn');
    const exerciseFeedback = document.getElementById('exercise-feedback');
    const exerciseList = document.getElementById('exercise-list');
    const progressText = document.getElementById('progress-text');
    const progressStats = document.getElementById('progress-stats');
    const progressCircle = document.getElementById('progress-circle-bg');

    let schedule = window.RehabSchedule.load();
    let selectedDate = window.RehabSchedule.dateKey(new Date());
    let weekStart = getWeekStart(new Date());
    let feedbackTimeout;

    window.RehabExercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.name;
        option.textContent = `${exercise.name} — ${exercise.categoryLabel}`;
        catalogSelect.appendChild(option);
    });

    function getWeekStart(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        return start;
    }

    function formatDate(dateKey, options) {
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('pl-PL', options);
    }

    function shiftDate(dateKey, days) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + days);
        return window.RehabSchedule.dateKey(date);
    }

    function getTodayKey() {
        return window.RehabSchedule.dateKey(new Date());
    }

    function clearExerciseFeedback() {
        window.clearTimeout(feedbackTimeout);
        exerciseFeedback.textContent = '';
        exerciseFeedback.hidden = true;
    }

    function showExerciseFeedback(message, isError = false) {
        window.clearTimeout(feedbackTimeout);
        exerciseFeedback.textContent = message;
        exerciseFeedback.className = `small mb-3 ${isError ? 'text-danger' : 'text-success'}`;
        exerciseFeedback.hidden = false;
        feedbackTimeout = window.setTimeout(clearExerciseFeedback, 4000);
    }

    function renderWeek() {
        const weekDays = document.getElementById('week-days');
        weekDays.replaceChildren();
        const todayKey = getTodayKey();
        document.getElementById('previous-week').disabled =
            window.RehabSchedule.dateKey(weekStart) <= window.RehabSchedule.dateKey(getWeekStart(new Date()));
        const lastDay = new Date(weekStart);
        lastDay.setDate(weekStart.getDate() + 6);
        document.getElementById('week-label').textContent =
            `${formatDate(window.RehabSchedule.dateKey(weekStart), { day: 'numeric', month: 'long' })} – ${formatDate(window.RehabSchedule.dateKey(lastDay), { day: 'numeric', month: 'long', year: 'numeric' })}`;

        for (let offset = 0; offset < 7; offset++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + offset);
            const dateKey = window.RehabSchedule.dateKey(date);
            const exercisesForDay = schedule[dateKey] || [];

            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.className = `week-day${dateKey === selectedDate ? ' selected' : ''}`;
            dayButton.setAttribute('aria-pressed', String(dateKey === selectedDate));
            dayButton.disabled = dateKey < todayKey;

            const weekday = document.createElement('span');
            weekday.textContent = date.toLocaleDateString('pl-PL', { weekday: 'short' });
            const dateText = document.createElement('strong');
            dateText.textContent = String(date.getDate());
            const count = document.createElement('span');
            count.className = 'day-count';
            count.textContent = exercisesForDay.length
                ? `${exercisesForDay.filter(exercise => exercise.completed).length}/${exercisesForDay.length}`
                : '—';

            dayButton.append(weekday, document.createElement('br'), dateText, count);
            dayButton.addEventListener('click', () => {
                if (dateKey < getTodayKey()) return;
                clearExerciseFeedback();
                selectedDate = dateKey;
                render();
            });
            weekDays.appendChild(dayButton);
        }
    }

    function createExerciseItem(exercise, index, exercises) {
        const item = document.createElement('div');
        item.className = `exercise-item d-flex align-items-center justify-content-between shadow-sm${exercise.completed ? ' completed' : ''}`;

        const details = document.createElement('div');
        details.className = 'd-flex align-items-center gap-3';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.style.width = '25px';
        checkbox.style.height = '25px';
        checkbox.checked = Boolean(exercise.completed);
        checkbox.setAttribute('aria-label', `Oznacz jako wykonane: ${exercise.name}`);
        checkbox.addEventListener('change', () => {
            if (selectedDate < getTodayKey()) {
                render();
                return;
            }
            exercises[index].completed = checkbox.checked;
            schedule[selectedDate] = exercises;
            window.RehabSchedule.save(schedule);
            render();
        });

        const name = document.createElement('span');
        name.className = 'fw-bold';
        name.textContent = exercise.name;
        if (exercise.completed) {
            name.style.textDecoration = 'line-through';
            name.style.color = '#888';
        }
        details.append(checkbox, name);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-sm text-danger fw-bold';
        deleteButton.textContent = 'USUŃ';
        deleteButton.addEventListener('click', () => {
            if (selectedDate < getTodayKey()) {
                render();
                return;
            }
            exercises.splice(index, 1);
            schedule[selectedDate] = exercises;
            window.RehabSchedule.save(schedule);
            render();
        });

        item.append(details, deleteButton);
        return item;
    }

    function renderExercises(exercises) {
        exerciseList.replaceChildren();
        if (exercises.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center p-4';
            emptyMessage.textContent = 'Brak ćwiczeń w planie na ten dzień. Dodaj je tutaj lub w Bazie ćwiczeń.';
            exerciseList.appendChild(emptyMessage);
            return;
        }

        exercises.forEach((exercise, index) => {
            exerciseList.appendChild(createExerciseItem(exercise, index, exercises));
        });
    }

    function renderProgress(exercises) {
        const completed = exercises.filter(exercise => exercise.completed).length;
        const total = exercises.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        progressText.textContent = `${percent}%`;
        progressStats.textContent = `${completed} / ${total}`;
        progressCircle.style.background = `conic-gradient(#FF8C42 ${percent}%, var(--chat-gray-bg) 0%)`;
    }

    function render() {
        if (selectedDate < getTodayKey()) {
            selectedDate = getTodayKey();
            weekStart = getWeekStart(new Date());
        }
        schedule = window.RehabSchedule.load();
        const exercises = schedule[selectedDate] || [];

        document.getElementById('selected-day-label').textContent =
            formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        renderWeek();
        renderExercises(exercises);
        renderProgress(exercises);
    }

    function addExercise(name) {
        if (selectedDate < getTodayKey()) {
            render();
            return false;
        }
        if (!window.RehabSchedule.addExercise(selectedDate, name)) {
            showExerciseFeedback('To ćwiczenie jest już zaplanowane na wybrany dzień.', true);
            return false;
        }
        showExerciseFeedback('Dodano ćwiczenie do planu.');
        render();
        return true;
    }

    function addCustomExercise() {
        const name = exerciseInput.value.trim();
        if (!name) return;
        if (addExercise(name)) exerciseInput.value = '';
    }

    function addCatalogExercise() {
        const exerciseName = catalogSelect.value;
        if (!exerciseName) {
            showExerciseFeedback('Wybierz ćwiczenie z listy Bazy ćwiczeń.', true);
            return;
        }
        if (addExercise(exerciseName)) catalogSelect.value = '';
    }

    addExerciseButton.addEventListener('click', addCustomExercise);
    exerciseInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') addCustomExercise();
    });
    addCatalogButton.addEventListener('click', addCatalogExercise);

    document.getElementById('previous-week').addEventListener('click', () => {
        if (window.RehabSchedule.dateKey(weekStart) <= window.RehabSchedule.dateKey(getWeekStart(new Date()))) return;
        weekStart.setDate(weekStart.getDate() - 7);
        selectedDate = shiftDate(selectedDate, -7);
        if (selectedDate < getTodayKey()) selectedDate = getTodayKey();
        clearExerciseFeedback();
        render();
    });
    document.getElementById('next-week').addEventListener('click', () => {
        weekStart.setDate(weekStart.getDate() + 7);
        selectedDate = shiftDate(selectedDate, 7);
        clearExerciseFeedback();
        render();
    });

    render();
    window.addEventListener('pageshow', event => {
        if (event.persisted) clearExerciseFeedback();
    });
})();
