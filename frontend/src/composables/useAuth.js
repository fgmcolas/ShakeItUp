import { ref, readonly, computed } from 'vue';

// Safely parse user from localStorage (handles corrupted/undefined values)
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

const user = ref(safelyParseUser());                // { id/ _id, username, email, ... } or null
const token = ref(localStorage.getItem('token') || null); // JWT if present

// Key used to store per-user ingredients (e.g., "myFridgeIngredients_<userId>")
const fridgeKey = computed(() => {
    const id = user.value?._id || user.value?.id || 'guest';
    return `myFridgeIngredients_${id}`;
});

// Persist login state (user + token) to localStorage
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

// Clear auth state
const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Update favorites inside the persisted user object
const updateFavorites = (favorites) => {
    if (user.value) {
        user.value.favorites = favorites;
        localStorage.setItem('user', JSON.stringify(user.value));
    }
};

// Expose readonly refs + actions
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
