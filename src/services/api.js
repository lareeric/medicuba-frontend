import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const inscription       = (data)   => api.post('/auth/inscription', data);
export const connexion         = (data)   => api.post('/auth/connexion', data);
export const getCours          = (params) => api.get('/cours', { params });
export const getCoursById      = (id)     => api.get(`/cours/${id}`);
export const getVersetDuJour   = ()       => api.get('/versets/aujourd-hui');
export const getGlossaire      = (params) => api.get('/glossaire', { params });
export const getQuizByCours    = (id)     => api.get(`/quiz/cours/${id}`);
export const soumettreReponse  = (data)   => api.post('/quiz/soumettre', data);
export const getNotes          = ()       => api.get('/notes');
export const ajouterNote       = (data)   => api.post('/notes', data);
export const supprimerNote     = (id)     => api.delete(`/notes/${id}`);
export const getFavoris        = ()       => api.get('/favoris');
export const ajouterFavori     = (data)   => api.post('/favoris', data);
export const supprimerFavori   = (id)     => api.delete(`/favoris/${id}`);
export const getPlanning       = ()       => api.get('/planning');
export const genererPlanning   = (data)   => api.post('/planning/generer', data);
export const marquerEffectue   = (id)     => api.patch(`/planning/${id}/effectue`);
export const annulerEffectue = (id) => api.patch(`/planning/${id}/annuler`);

export default api;