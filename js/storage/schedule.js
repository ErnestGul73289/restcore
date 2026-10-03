(() => {
    function toDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getStorageKey() {
        const userId = window.RehabAuth?.getCurrentUserId();
        if (!userId) throw new Error('Zaloguj się, aby uzyskać dostęp do swojego planu ćwiczeń.');
        return `rehab_schedule_${userId}`;
    }

    function load() {
        const storageKey = getStorageKey();
        return window.RehabStorage.readJSON(storageKey, {});
    }

    function save(schedule) {
        window.RehabStorage.writeJSON(getStorageKey(), schedule);
    }

    function addExercise(dateKey, name) {
        const schedule = load();
        const exercises = schedule[dateKey] || [];
        const normalizedName = name.trim().toLocaleLowerCase('pl');
        if (exercises.some(exercise => exercise.name.trim().toLocaleLowerCase('pl') === normalizedName)) {
            return false;
        }
        exercises.push({ name: name.trim(), completed: false });
        schedule[dateKey] = exercises;
        save(schedule);
        return true;
    }

    window.RehabSchedule = {
        addExercise,
        dateKey: toDateKey,
        load,
        save
    };
})();
