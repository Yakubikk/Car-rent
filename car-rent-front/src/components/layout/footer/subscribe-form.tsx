'use client';

import React, {useState} from "react";

const SubscribeFormFooter: React.FC = () => {
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(false);
    
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ email: value, acceptedTerms: checked });
    };

    return (
        <form autoComplete='off' onSubmit={onSubmit} className="w-full">
            <div className="flex flex-col gap-4 w-full">
                <input
                    required
                    className="w-full px-3 py-2 border border-white bg-transparent text-white placeholder-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ваш email"
                />
                <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    type="submit"
                >
                    Подписаться
                </button>
                
                <div className="flex items-center">
                    <input
                        id="terms-footer"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-white bg-transparent rounded focus:ring-blue-500"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <label htmlFor="terms-footer" className="ml-2 text-sm text-white">
                        Я согласен с условиями использования
                    </label>
                </div>
            </div>
        </form>
    );
}

export {SubscribeFormFooter};
export default SubscribeFormFooter;
