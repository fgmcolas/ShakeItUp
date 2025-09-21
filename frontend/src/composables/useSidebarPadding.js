import { ref, computed, onBeforeUnmount } from 'vue';
import { useSidebarStore } from '../stores/sidebar';

export function useSidebarPadding() {
    const sidebar = useSidebarStore();
    const isMobile = ref(false);

    // Track viewport width (simple mobile check)
    const updateIsMobile = () => {
        isMobile.value = window.innerWidth < 768; // 768px = Tailwind md breakpoint
    };

    // Bind resize listener on client
    if (typeof window !== 'undefined') {
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        onBeforeUnmount(() => {
            window.removeEventListener('resize', updateIsMobile);
        });
    }

    // Left padding accounts for a 256px sidebar + 1.5rem gap
    const paddingClass = computed(() => {
        if (isMobile.value) {
            return sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6';
        }
        return 'pl-[calc(256px+1.5rem)] pr-6';
    });

    return { paddingClass };
}
