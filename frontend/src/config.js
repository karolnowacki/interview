const prod = {
    url: {
        API_URL: '/api',
        WS_URL: 'ws://'+window.location.host+'/api/admin/live'
    }
};

const dev = {
    url: {
        API_URL: 'http://localhost:5000/api',
        WS_URL: 'ws://localhost:5000/api/admin/live'
    }
};

export const config = process.env.NODE_ENV === 'production' ? prod : dev;