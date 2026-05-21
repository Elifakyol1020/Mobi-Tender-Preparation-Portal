import '../css/Header.css'
import logo from "../image/logo.png";

function Header({ lang, onToggleLang, actionLabel, onAction }) {
    return (
        <div className="header-banner">
            <div className="header-brand">
                <img src={logo} alt="Mobivisor Logo" className="mobivisor-logo" />
                <span className="portal-title">Tender Preparation Portal</span>
            </div>
            <div className="header-actions">
                {onToggleLang && (
                    <button onClick={onToggleLang} className="header-lang-button" type="button">
                        {lang}
                    </button>
                )}
                {onAction && (
                    <button onClick={onAction} className="header-action-button" type="button">
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Header
