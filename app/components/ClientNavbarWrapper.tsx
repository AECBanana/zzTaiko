'use client';

import { useDarkMode } from '@/app/hooks/useDarkMode';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientNavbarWrapper() {
    const { darkMode, toggleDarkMode, isUsingSystem, getToggleLabel, getToggleText } = useDarkMode();
    const pathname = usePathname();

    return (
        <Navbar
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            isUsingSystem={isUsingSystem}
            toggleLabel={getToggleLabel()}
            toggleText={getToggleText()}
        />
    );
}