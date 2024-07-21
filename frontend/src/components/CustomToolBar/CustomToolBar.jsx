import { Toolbar } from 'react-big-calendar';

const CustomToolbar = (toolbar) => {
    const { onNavigate, label } = toolbar;

    return (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button onClick={() => onNavigate('PREV')}>Back</button>
                <span className="rbc-btn-group-label">{label}</span>
                <button onClick={() => onNavigate('NEXT')}>Next</button>
            </span>
        </div>
    );
};
