
import {Icon24Hours} from "@tabler/icons-react";
import { Link } from "react-router-dom";

const Logo = () => {
    return (
        <Link to='/' className='group w-fit'>
            <div className='flex flex-row gap-2 items-center'>
                <Icon24Hours width={48} height={48} className='group-hover:animate-spin' />
                <h4 className='text-2xl font-bold'>
                    Логотип
                </h4>
            </div>
        </Link>
    );
}

export { Logo };
export default Logo;
