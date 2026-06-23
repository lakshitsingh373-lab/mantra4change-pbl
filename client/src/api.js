import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getDashboard = (params) => axios.get(`${BASE}/dashboard`, { params });
export const getFilters = () => axios.get(`${BASE}/dashboard/filters`);
export const getGrants = (params) => axios.get(`${BASE}/grant`, { params });
export const getGrantList = () => axios.get(`${BASE}/grant/list`);
export const getSummary = (params) => axios.get(`${BASE}/summary`, { params });