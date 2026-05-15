import { useEffect, useState } from 'react';
import axios from 'axios';

export const DEFAULT_CLIENT_THEME = {
    pageBg: '#e9f7f6',
    cardBg: '#ffffff',
    panelBg: '#f8fcfc',
    softBg: '#dff4f2'
};

export const getClientThemeStyle = (theme) => ({
    '--client-page-bg': theme.pageBg,
    '--client-card-bg': theme.cardBg,
    '--client-panel-bg': theme.panelBg,
    '--client-soft-bg': theme.softBg
});

const useClientTheme = () => {
    const [clientTheme, setClientTheme] = useState(DEFAULT_CLIENT_THEME);

    useEffect(() => {
        const fetchClientTheme = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/background-settings');
                const settings = Array.isArray(res.data) ? res.data : [];
                const getSetting = (name, fallback) => settings.find((item) => item.setting_name === name)?.setting_value || fallback;

                setClientTheme({
                    pageBg: getSetting('client_theme_page_bg', DEFAULT_CLIENT_THEME.pageBg),
                    cardBg: getSetting('client_theme_card_bg', DEFAULT_CLIENT_THEME.cardBg),
                    panelBg: getSetting('client_theme_panel_bg', DEFAULT_CLIENT_THEME.panelBg),
                    softBg: getSetting('client_theme_soft_bg', DEFAULT_CLIENT_THEME.softBg)
                });
            } catch {
                setClientTheme(DEFAULT_CLIENT_THEME);
            }
        };

        fetchClientTheme();
    }, []);

    return clientTheme;
};

export default useClientTheme;
