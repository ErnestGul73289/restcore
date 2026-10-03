(() => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const status = document.getElementById('account-status');
    const params = new URLSearchParams(location.search);

    function showStatus(message, isError = true) {
        status.textContent = message;
        status.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    }

    function selectTab(tab) {
        const registering = tab === registerTab;
        loginTab.classList.toggle('active', !registering);
        registerTab.classList.toggle('active', registering);
        loginTab.setAttribute('aria-selected', String(!registering));
        registerTab.setAttribute('aria-selected', String(registering));
        loginPanel.classList.toggle('d-none', registering);
        registerPanel.classList.toggle('d-none', !registering);
        status.classList.add('d-none');
    }

    function getDestination() {
        const allowedPages = new Set(['index.html', 'baza_cwiczen.html', 'postep.html', 'kamera.html', 'kontakt.html']);
        const requestedPage = params.get('next');
        return allowedPages.has(requestedPage) ? requestedPage : 'index.html';
    }

    async function submitAccount(form, action) {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        status.classList.add('d-none');
        try {
            const data = new FormData(form);
            await action(data);
            location.replace(getDestination());
        } catch (error) {
            console.error('Nie udało się obsłużyć konta lokalnego.', error);
            showStatus(error instanceof Error ? error.message : 'Nie udało się zapisać konta w tej przeglądarce.');
        } finally {
            submitButton.disabled = false;
        }
    }

    loginTab.addEventListener('click', () => selectTab(loginTab));
    registerTab.addEventListener('click', () => selectTab(registerTab));
    if (!params.has('error')) {
        try {
            selectTab(window.RehabAuth.hasAccounts() ? loginTab : registerTab);
        } catch (error) {
            console.error('Nie udało się odczytać lokalnych kont.', error);
            showStatus('Nie udało się odczytać konta. Sprawdź zapis w tej przeglądarce.');
        }
    } else {
        showStatus('Nie udało się odczytać konta. Sprawdź zapis w tej przeglądarce.');
    }

    loginPanel.addEventListener('submit', event => {
        event.preventDefault();
        submitAccount(loginPanel, data => window.RehabAuth.logIn(
            data.get('username'),
            data.get('password')
        ));
    });

    registerPanel.addEventListener('submit', event => {
        event.preventDefault();
        const password = document.getElementById('register-password').value;
        const confirmation = document.getElementById('register-confirm-password').value;
        if (password !== confirmation) {
            showStatus('Podane hasła nie są takie same.');
            return;
        }
        submitAccount(registerPanel, data => window.RehabAuth.createAccount(
            data.get('displayName'),
            data.get('username'),
            data.get('password')
        ));
    });
})();
