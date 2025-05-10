import { ref, readonly, computed } from 'vue';

function safelyParseUser() {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined') {
        localStorage.removeItem('user');
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to parse user from localStorage:', raw);
        localStorage.removeItem('user');
        return null;
    }
}

const user = ref(safelyParseUser());
const token = ref(localStorage.getItem('token') || null);

const fridgeKey = computed(() => {
    const id = user.value?._id || user.value?.id || 'guest';
    return `myFridgeIngredients_${id}`;
});

const login = (userData) => {
    if (!userData?.user || !userData?.token) {
        console.warn('Invalid login data:', userData);
        return;
    }

    user.value = userData.user;
    token.value = userData.token;

    localStorage.setItem('token', token.value);
    localStorage.setItem('user', JSON.stringify(user.value));
};

const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const updateFavorites = (favorites) => {
    if (user.value) {
        user.value.favorites = favorites;
        localStorage.setItem('user', JSON.stringify(user.value));
    }
};

export function useAuth() {
    return {
        user: readonly(user),
        token: readonly(token),
        login,
        logout,
        updateFavorites,
        fridgeKey,
    };
}
