import React from 'react'
import '../css/Header.css'
import logo from "../image/logo.png";

function Header() {
    return (
        <div className="header-banner">
            <img src={logo} alt="Mobivisor Logo" className="mobivisor-logo" />
            <span className="portal-title">Tender Preparation Portal</span>
        </div>
    )
}

export default Header