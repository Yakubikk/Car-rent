'use client';

import React from "react";
import {useSidebar} from "@/store";
import './toggle.scss';
import {LogoutButton} from "@/components";

const SidebarToggle: React.FC = () => {
    const { toggle } = useSidebar();
    return (
        <div className="flex flex-row h-full items-center">
            <LogoutButton />
            <div className="parent" onClick={toggle}>
                <div className="button">
                    <div className="button__horizontal" />
                    <div className="button__vertical" />
                </div>
            </div>
        </div>
    );
}

export {SidebarToggle};
export default SidebarToggle;