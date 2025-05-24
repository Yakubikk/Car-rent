import React, { useState } from "react";

const SubscribeForm: React.FC = () => {
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(false);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ email: value, acceptedTerms: checked });
    };

    return (
        <form autoComplete='off' onSubmit={onSubmit} className="w-full">
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-row gap-2 w-full">
                    <input
                        required
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Ваш email"
                    />
                    <button
                        className="w-1/3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        type="submit"
                    >
                        Подписаться
                    </button>
                </div>
                
                <div className="flex items-center">
                    <input
                        id="terms"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                        Я согласен с условиями использования
                    </label>
                </div>
            </div>
        </form>
    );
};

export { SubscribeForm };
export default SubscribeForm;
