import axios from 'axios';


const APIBASEURL = `${process.env.REACT_APP_API}/api`;
if(localStorage.getItem('token') !== null) {
var api = axios.create({
        baseURL: APIBASEURL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${localStorage.getItem('token')}`
        }
    });
}
else {
    api = axios.create({
        baseURL: APIBASEURL,
    });
}

const endpoints = {
    // Register
    register: (email, username, password) => api.post('users/register/', {
        email: email,
        username: username,
        password: password
    }),
    
    // Login
    login: (email, password) => api.post('users/login/', {
        email: email,
        password: password
    }),

    // Logout
    logout: () => api.post('users/logout/'),

    // Scrape Data
    scrapeData: (url) => api.post('product/scrape_data/', {
        url: url
    }),

    // Get Product
    getProduct: (params) =>  api.get(`product/?${params}`),

    // bulk Remove Product
    bulkRemoveProduct: (idArray) => api.post('product/bulk_remove_product/', {
        idArray: idArray
    }),

    // bulk Insert Product
    bulkInsertProduct: (idArray) => api.post('product/insert_products/', {
        idArray: idArray
    }),

    // Get Setting
    getSetting: () => api.get('setting/'),

    // Register Setting
    registerSetting: (data) => api.post('setting/register/', data),

    // Update Setting
    updateSetting: (data) =>  api.post('setting/change/', data)
};

export default endpoints;