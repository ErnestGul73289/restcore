(() => {
    function readJSON(key, fallbackValue) {
        const serializedValue = localStorage.getItem(key);
        return serializedValue === null ? fallbackValue : JSON.parse(serializedValue);
    }

    function writeJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function remove(key) {
        localStorage.removeItem(key);
    }

    function accountKey(namespace, userId) {
        if (!userId) throw new Error('Zaloguj się, aby uzyskać dostęp do swoich danych.');
        return `rehab_${namespace}_${userId}`;
    }

    function clearAccountData(namespace, accounts) {
        accounts.forEach(account => {
            if (typeof account.id === 'string') {
                remove(accountKey(namespace, account.id));
            }
        });
    }

    window.RehabStorage = {
        accountKey,
        clearAccountData,
        readJSON,
        remove,
        writeJSON
    };
})();
