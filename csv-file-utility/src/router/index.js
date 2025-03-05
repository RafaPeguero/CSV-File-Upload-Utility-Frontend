import { createRouter, createWebHistory } from 'vue-router';
import FileUploader from '../components/FileUploader.vue';
import Orders from '../components/OrdersList.vue';

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: FileUploader
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;