(() => {
    const today = new Date();
    const dateElement = document.getElementById('today-date');
    dateElement.textContent = `Dziś jest ${today.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}`;

    const schedule = window.RehabSchedule.load();
    const upcomingDays = document.getElementById('upcoming-days');
    for (let offset = 0; offset < 3; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        const exercises = schedule[window.RehabSchedule.dateKey(date)] || [];
        const isComplete = exercises.length > 0 && exercises.every(exercise => exercise.completed);

        const day = document.createElement('div');
        day.className = `day-item${isComplete ? ' completed' : ''}`;

        const dot = document.createElement('div');
        dot.className = 'day-dot';
        if (isComplete) dot.style.background = '#28a745';
        day.appendChild(dot);

        const details = document.createElement('div');
        const dateLabel = document.createElement('div');
        dateLabel.className = 'small text-muted text-uppercase';
        dateLabel.textContent = offset === 0
            ? 'DZISIAJ'
            : date.toLocaleDateString('pl-PL', { weekday: 'long' });

        const exerciseList = document.createElement('div');
        exerciseList.className = 'fw-bold';
        exerciseList.textContent = exercises.length
            ? exercises.map(exercise => exercise.name).join(', ')
            : 'Brak zaplanowanych ćwiczeń';

        details.append(dateLabel, exerciseList);
        day.append(dot, details);
        if (isComplete) {
            const check = document.createElement('span');
            check.className = 'ms-auto';
            check.textContent = '✅';
            day.appendChild(check);
        }
        upcomingDays.appendChild(day);
    }
})();
