// Mock for  window.Telegram.WebApp
export const TelegramWebAppMock = {
    initData: 'mock_init_data',
    initDataUnsafe: {
        user: {
            id: '123456789',
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User',
            language_code: 'en',
        },
        query_id: 'mock_query_id',
        start_param:6853207832,
    },
    MainButton: {
        text: '',
        color: '#000000',
        isVisible: false,
        isProgressVisible: false,
        isActive: false,
        show() {
            this.isVisible = true;
            console.log('MainButton shown');
        },
        hide() {
            this.isVisible = false;
            console.log('MainButton hidden');
        },
        setText(text) {
            this.text = text;
            console.log(`MainButton text set to: ${text}`);
        },
        setColor(color) {
            this.color = color;
            console.log(`MainButton color set to: ${color}`);
        },
        onClick(callback) {
            console.log('MainButton click callback set');
            this._clickCallback = callback;
        },
        click() {
            if (this._clickCallback) {
                this._clickCallback();
            } else {
                console.warn('MainButton click event fired, but no callback is set');
            }
        },
    },
    themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#aaaaaa',
        button_color: '#0088cc',
        button_text_color: '#ffffff',
    },
    HapticFeedback: {
        impactOccurred() {
            console.log('Haptic feedback: impact occurred');
        },
    },
    expand() {
        console.log('Telegram WebApp expanded');
    },
    close() {
        console.log('Telegram WebApp closed');
    },
};
