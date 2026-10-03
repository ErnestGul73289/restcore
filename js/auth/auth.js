(() => {
    const accountsKey = 'rehab_accounts_v1';
    const sessionKey = 'rehab_session_user';
    const accountPage = 'konto.html';
    const iterations = 210000;
    const encoder = new TextEncoder();

    function readAccounts() {
        const accounts = window.RehabStorage.readJSON(accountsKey, []);
        if (!Array.isArray(accounts)) throw new Error('Nieprawidłowy zapis lokalnych kont.');
        return accounts;
    }

    function writeAccounts(accounts) {
        window.RehabStorage.writeJSON(accountsKey, accounts);
    }

    function removeCameraWorkoutHistory() {
        window.RehabStorage.clearAccountData('workouts', readAccounts());
    }

    function toHex(bytes) {
        return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function derivePasswordHash(password, saltHex) {
        const salt = Uint8Array.from(saltHex.match(/.{2}/g), value => parseInt(value, 16));
        const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
        return toHex(await crypto.subtle.deriveBits({
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt,
            iterations
        }, keyMaterial, 256));
    }

    function equalHashes(left, right) {
        if (left.length !== right.length) return false;
        let difference = 0;
        for (let index = 0; index < left.length; index++) {
            difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
        }
        return difference === 0;
    }

    function getAccount(userId) {
        return readAccounts().find(account => account.id === userId) || null;
    }

    function currentAccount() {
        const userId = sessionStorage.getItem(sessionKey);
        if (!userId) return null;
        const account = getAccount(userId);
        if (!account) {
            sessionStorage.removeItem(sessionKey);
            return null;
        }
        return account;
    }

    function goToLogin(reason) {
        const page = location.pathname.split('/').pop();
        const params = new URLSearchParams();
        if (page && page !== accountPage) params.set('next', page);
        if (reason) params.set('error', reason);
        const query = params.toString();
        location.replace(`${accountPage}${query ? `?${query}` : ''}`);
    }

    try {
        if (localStorage.getItem('rehab_camera_history_removed_v1') !== 'true') {
            removeCameraWorkoutHistory();
            window.RehabStorage.writeJSON('rehab_camera_history_removed_v1', true);
        }
    } catch (error) {
        console.error('Nie udało się usunąć zapisanej historii treningów z kamery.', error);
    }

    const isAccountPage = location.pathname.endsWith(`/${accountPage}`) ||
        location.pathname === accountPage || location.pathname.endsWith(accountPage);
    if (!isAccountPage) {
        try {
            if (!currentAccount()) {
                goToLogin();
                return;
            }
        } catch (error) {
            console.error('Nie można zweryfikować lokalnego konta.', error);
            goToLogin('storage');
            return;
        }
    }

    window.RehabAuth = {
        async createAccount(displayName, username, password) {
            const accounts = readAccounts();
            const normalizedUsername = username.trim().toLocaleLowerCase('pl');
            const normalizedDisplayName = displayName.trim();
            if (!/^[a-z0-9._-]{3,24}$/.test(normalizedUsername)) {
                throw new Error('Nazwa użytkownika musi mieć 3–24 dozwolone znaki.');
            }
            if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 40) {
                throw new Error('Nazwa wyświetlana musi mieć od 2 do 40 znaków.');
            }
            if (password.length < 8) throw new Error('Hasło musi mieć co najmniej 8 znaków.');
            if (accounts.some(account => account.username === normalizedUsername)) {
                throw new Error('Ta nazwa użytkownika jest już zajęta.');
            }

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const id = crypto.randomUUID();
            const saltHex = toHex(salt);
            const passwordHash = await derivePasswordHash(password, saltHex);
            const account = {
                id,
                username: normalizedUsername,
                displayName: normalizedDisplayName,
                salt: saltHex,
                passwordHash
            };
            const latestAccounts = readAccounts();
            if (latestAccounts.some(entry => entry.username === normalizedUsername)) {
                throw new Error('Ta nazwa użytkownika jest już zajęta.');
            }
            latestAccounts.push(account);
            writeAccounts(latestAccounts);
            sessionStorage.setItem(sessionKey, id);
            return { id, username: account.username, displayName: account.displayName };
        },

        async logIn(username, password) {
            const normalizedUsername = username.trim().toLocaleLowerCase('pl');
            const account = readAccounts().find(entry => entry.username === normalizedUsername);
            if (!account) throw new Error('Nieprawidłowa nazwa użytkownika lub hasło.');
            const passwordHash = await derivePasswordHash(password, account.salt);
            if (!equalHashes(passwordHash, account.passwordHash)) {
                throw new Error('Nieprawidłowa nazwa użytkownika lub hasło.');
            }
            sessionStorage.setItem(sessionKey, account.id);
            return { id: account.id, username: account.username, displayName: account.displayName };
        },

        getCurrentUser() {
            const account = currentAccount();
            return account ? {
                id: account.id,
                username: account.username,
                displayName: account.displayName
            } : null;
        },

        getCurrentUserId() {
            return currentAccount()?.id || null;
        },

        hasAccounts() {
            return readAccounts().length > 0;
        },

        logOut() {
            sessionStorage.removeItem(sessionKey);
            location.replace(accountPage);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (isAccountPage) return;
        const user = window.RehabAuth.getCurrentUser();
        if (!user) {
            goToLogin();
            return;
        }

        document.querySelectorAll('[data-account-name]').forEach(element => {
            element.textContent = user.displayName;
        });

        const topbar = document.querySelector('.app-topbar');
        const nav = topbar?.querySelector('.topbar-nav');
        if (topbar && nav) {
            const accountMenu = document.createElement('div');
            accountMenu.className = 'topbar-account';

            const accountName = document.createElement('span');
            accountName.className = 'topbar-account-name';
            accountName.textContent = user.displayName;

            const logOutButton = document.createElement('button');
            logOutButton.className = 'topbar-logout';
            logOutButton.type = 'button';
            logOutButton.textContent = 'Wyloguj';
            logOutButton.addEventListener('click', () => window.RehabAuth.logOut());

            accountMenu.append(accountName, logOutButton);
            topbar.append(accountMenu);
        }
    });
})();
