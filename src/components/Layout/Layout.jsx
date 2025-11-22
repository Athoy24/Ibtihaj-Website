import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../Cart/CartSidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <CartSidebar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
