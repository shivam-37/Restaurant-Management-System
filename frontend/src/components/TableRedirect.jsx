import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TableRedirect = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            localStorage.setItem('tableNumber', id);
            console.log(`Table ${id} assigned via QR code`);
        }
        navigate('/dashboard'); // Redirect to dashboard where Menu is located
    }, [id, navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-xl font-bold">Setting up your table...</h1>
                <p className="text-gray-500">Welcome to Table {id}</p>
            </div>
        </div>
    );
};

export default TableRedirect;
