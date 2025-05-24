import React from "react";
import {Logo} from "@/components";
import DropdownMenuLinks from "./dropdown-menu-links";
import SidebarToggle from "../sidebar/sidebar-toggle";

const LowerHeader: React.FC = () => {

    return (
        <div className='border-t border-b border-gray-300 flex justify-between items-center pl-10 h-[84px]'>
            <Logo />
            <DropdownMenuLinks />
            <SidebarToggle />
        </div>
    );
}

export { LowerHeader };
export default LowerHeader;
