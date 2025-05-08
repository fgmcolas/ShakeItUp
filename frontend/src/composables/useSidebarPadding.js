import { ref, computed, onBeforeUnmount } from 'vue';
import { useSidebarStore } from '../stores/sidebar';

export function useSidebarPadding() {
    const sidebar = useSidebarStore();
    const isMobile = ref(false);

    const updateIsMobile = () => {
        isMobile.value = window.innerWidth < 768;
    };

    if (typeof window !== 'undefined') {
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        onBeforeUnmount(() => {
            window.removeEventListener('resize', updateIsMobile);
        });
    }

    const paddingClass = computed(() => {
        if (isMobile.value) {
            return sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6';
        }
        return 'pl-[calc(256px+1.5rem)] pr-6';
    });

    return { paddingClass };
}
