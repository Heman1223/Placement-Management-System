import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import './UtilityPages.css';

const Unauthorized = () => {
    return (
        <div className="utility-page">
            <div className="utility-card">
                <div className="utility-icon error">
                    <ShieldX size={48} />
                </div>
                <h1>Access Denied</h1>
                <p>
                    You don't have permission to access this page.
                    Please contact your administrator if you believe this is an error.
                </p>
                <Link to="/">
                    <Button variant="secondary" icon={ArrowLeft}>
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
