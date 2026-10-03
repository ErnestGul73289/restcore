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
        return addExerciseEntries(dateKey, name, 1, false) > 0;
    }

    function addExerciseEntries(dateKey, name, count = 1, allowDuplicate = false) {
        const schedule = load();
        const exercises = schedule[dateKey] || [];
        const trimmedName = name.trim();
        const normalizedName = trimmedName.toLocaleLowerCase('pl');
        let addedCount = 0;

        for (let index = 0; index < count; index += 1) {
            const alreadyExists = exercises.some(exercise => exercise.name.trim().toLocaleLowerCase('pl') === normalizedName);
            if (!allowDuplicate && alreadyExists) {
                break;
            }
            exercises.push({ name: trimmedName, completed: false });
            addedCount += 1;
        }

        if (addedCount > 0) {
            schedule[dateKey] = exercises;
            save(schedule);
        }

        return addedCount;
    }

    window.RehabSchedule = {
        addExercise,
        addExerciseEntries,
        dateKey: toDateKey,
        load,
        save
    };
})();
