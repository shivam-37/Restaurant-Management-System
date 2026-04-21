import { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getRestaurantDetails } from '../services/api';

const TableRedirect = () => {
    const { restaurantId, tableNumber } = useParams();
    const navigate = useNavigate();
    const { setSelectedRestaurant } = useContext(AuthContext);

    useEffect(() => {
        const setupTable = async () => {
            if (restaurantId && tableNumber) {
                localStorage.setItem('tableNumber', tableNumber);
                try {
                    const { data } = await getRestaurantDetails(restaurantId);
                    setSelectedRestaurant(data);
                    console.log(`Table ${tableNumber} at ${data.name} assigned via QR code`);
                } catch (error) {
                    console.error("Failed to fetch restaurant details during redirect", error);
                }
            }
            navigate('/dashboard');
        };
        setupTable();
    }, [restaurantId, tableNumber, navigate, setSelectedRestaurant]);

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-xl font-bold">Setting up your table...</h1>
                <p className="text-gray-500">Welcome to Table {tableNumber}</p>
            </div>
        </div>
    );
};

export default TableRedirect;
