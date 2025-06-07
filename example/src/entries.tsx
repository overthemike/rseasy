import { createPages } from 'waku';

import RootLayout from './pages/_layout.js';
import HomePage from './pages/index.js';
import ProductsPage from './pages/products.js';
import UsersPage from './pages/users.js';

export default createPages(async ({ createPage, createLayout }) => {
  createLayout({
    render: 'static',
    path: '/',
    component: RootLayout,
  });

  createPage({
    render: 'static',
    path: '/',
    component: HomePage,
  });

  createPage({
    render: 'static',
    path: '/products',
    component: ProductsPage,
  });

  createPage({
    render: 'static',
    path: '/users',
    component: UsersPage,
  });
});