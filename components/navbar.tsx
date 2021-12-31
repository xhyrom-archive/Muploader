import { useEffect, useState } from 'react';
import { Navbar } from 'react-bulma-components';
import { strToBool } from '../utils/stringToBool';

const NavbarComponent = () => {
    const [itemActive, setItemActive] = useState('nothing');
    const [isActive, setisActive] = useState(false);
    
    useEffect(() => {
        const path = window.location.pathname;

        setItemActive(path);
    })

    return (
        <div style={{ top: 0 }}>
            <Navbar>
                <Navbar.Brand>
                    <Navbar.Item style={{ textDecoration: 'none', fontFamily: 'Montserrat' }}>
                    <b style={{ background: '-webkit-linear-gradient(45deg, #9f0030, #ff0055 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MUPLOADER</b>
                    </Navbar.Item>
                    <Navbar.Burger onClick={() => setisActive(!isActive)} />
                </Navbar.Brand>
                <Navbar.Menu className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                    <Navbar.Container>
                        <Navbar.Item href='/' className={`${itemActive === '/' ? 'is-active' : '' }`}>
                            Home
                        </Navbar.Item>
                        { strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT) &&
                            <Navbar.Item href='/generator/sharex' className={`${itemActive === '/generator/sharex' ? 'is-active' : ''}`}>
                                Config
                            </Navbar.Item>
                        }
                        <Navbar.Item href='/statistics' className={`${itemActive === '/statistics' ? 'is-active' : '' }`}>
                            Statistics
                        </Navbar.Item>
                        <Navbar.Item href='/tos' className={`${itemActive === '/tos' ? 'is-active' : '' }`}>
                            Terms of Services
                        </Navbar.Item>
                    </Navbar.Container>
                </Navbar.Menu>
            </Navbar>
        </div>
    )
}

export default NavbarComponent;