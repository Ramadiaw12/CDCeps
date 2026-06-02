// ============================================================
// components/Layout.jsx
// Layout principal avec navbar et gestion du padding
// ============================================================

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
    return (
        <div className="layout">
            <Navbar />
            <main className="layout-main">
                <Outlet />
            </main>
            
        </div>
    );
}

export default Layout;