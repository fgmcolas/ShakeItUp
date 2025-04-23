import { ref } from 'vue';

const user = ref(null);

export function useAuth() {
    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        user.value = userData;
    };

    const logout = () => {
        localStorage.removeItem('user');
        user.value = null;
    };

    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                user.value = JSON.parse(storedUser);
            } catch (e) {
                console.error('Invalid user data in localStorage');
                user.value = null;
            }
        }
    };

    return {
        user,
        login,
        logout,
        loadUserFromStorage
    };
}
