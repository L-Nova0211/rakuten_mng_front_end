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

    // Get Credential
    getCredential: () => api.get('users/get_credential/'),

    // Update
    update: (id, data) => api.patch(`users/${id}/`, data),

    // Logout
    logout: () => api.post('users/logout/'),

    // Scrape Data
    scrapeData: (url) => api.post('product/scrape_data/', {
        url: url
    }),

    // Get Product
    getProduct: (params) =>  api.get(`product/?${params}`),

    // Sell Product
    sellProduct: (id) => api.post(`product/${id}/sell_product/`),

    // Update Product
    updateProduct: (id, data) => api.patch(`product/${id}/`, data),

    // Remove Product
    removeProduct: (id) => api.delete(`product/${id}`),

    // Bulk Sell Product
    bulkSellProduct: (idArray) => api.post('product/bulk_sell_product/', {
        idArray: idArray
    }),

    // Bulk Remove Product
    bulkRemoveProduct: (idArray) => api.post('product/bulk_remove_product/', {
        idArray: idArray
    }),

    // Download Products
    downloadProducts: (idArray) => api.post('product/download_products/', {
        idArray: idArray
    }),

    // Get NG
    getNG: (params) => api.get(`ng/?${params}`),

    // Register NG
    registerNG: (type, name) => api.post('ng/register/', {
        type: type,
        name: name
    }),

    // Update NG
    updateNG: (id, data) => api.patch(`ng/${id}/`, data),

    // Remove NG
    removeNG: (id) => api.delete(`ng/${id}/`),

    // Bulk Active NG
    bulkActiveNG: (idArray) => api.post('ng/bulk_active_ng/', {
        idArray: idArray
    }),
    
    // Bulk Remove NG
    bulkRemoveNG: (idArray) => api.post('ng/bulk_remove_ng/', {
        idArray: idArray
    }),
};

export default endpoints;