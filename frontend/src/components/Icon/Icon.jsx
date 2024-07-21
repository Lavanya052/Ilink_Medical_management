import { Email, Lock } from '@mui/icons-material';

const Icon = ({ type }) => {
    const icons = {
        email: <Email className="icon" />,
        password: <Lock className="icon" />,
    };
    return icons[type];
};

export default Icon;