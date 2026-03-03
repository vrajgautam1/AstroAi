import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        try {
            const res = await registerUser({ email, password });
            setMessage(res.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Soft radial glow behind the card */}
            <div className="absolute w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="relative w-full max-w-[400px] bg-white/[0.05] backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.1)] border border-white/10 z-10 transition-all duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">Register</h2>
                    <p className="text-indigo-200/60 text-sm mt-2 font-medium">Register using email or your gmail account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center backdrop-blur-md">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm mb-6 text-center backdrop-blur-md">
                        {message}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="w-full h-[44px] flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl text-white/90 font-medium hover:bg-white/10 transition-all duration-300 mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative flex items-center justify-center mb-6 opacity-60">
                    <div className="absolute border-t border-white/10 w-full"></div>
                    <span className="bg-[#0f172a] px-3 text-[11px] uppercase rounded-lg tracking-wider text-indigo-200/60 relative font-semibold">
                        Or continue with email
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-[44px] px-4 rounded-xl bg-white/5 border border-white/15 text-white/90 placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all duration-300"
                    />
                    <input
                        type="password"
                        placeholder="Secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full h-[44px] px-4 rounded-xl bg-white/5 border border-white/15 text-white/90 placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all duration-300"
                    />
                    <button
                        type="submit"
                        className="w-full h-[44px] mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-[0.98]"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-sm text-indigo-200/50 mt-8 font-medium">
                    Already authenticated? <Link to="/login" className="text-violet-400 hover:text-violet-300 hover:drop-shadow-[0_0_5px_rgba(139,92,246,0.5)] transition-all duration-300">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
