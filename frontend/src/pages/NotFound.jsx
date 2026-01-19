import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import './UtilityPages.css';

const NotFound = () => {
    return (
        <div className="utility-page">
            <div className="utility-card">
                <div className="utility-icon">
                    <FileQuestion size={48} />
                </div>
                <h1>Page Not Found</h1>
                <p>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/">
                    <Button icon={ArrowLeft}>
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
