import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logoutUser } from '../api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            // For Google OAuth, we might receive token in query param.
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');
            if (tokenFromUrl) {
                localStorage.setItem('token', tokenFromUrl);
                // Clean up URL
                window.history.replaceState({}, document.title, "/dashboard");
            }

            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const data = await getMe(token);
                setUser(data.user);
            } catch (err) {
                setError(err.message);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (error) return <p>Error: {error}</p>;
    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome, {user.email}!</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;
