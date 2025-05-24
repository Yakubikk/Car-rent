

const LogoutButton = () => {
    return (
        <button
            className="px-2 py-1 cursor-pointer border border-black text-gray-600 hover:text-gray-800 transition-colors duration-200"
            onClick={() => {
                // Add your logout logic here
                console.log("User logged out");
            }}
        >
            Logout
        </button>
    );
}

export { LogoutButton };
export default LogoutButton;
