import React from 'react';
import DashboardLayout from './DashboardLayout';

/**
 * Legacy wrapper: Aliases the new DashboardLayout 
 * so completely rewriting import paths across 12 sub-pages isn't necessary.
 */
const Layout = ({ children, title, subtitle }) => {
    return <DashboardLayout title={title} subtitle={subtitle}>{children}</DashboardLayout>;
};

export default Layout;
