import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
          <header>
              <Link to= "/">
                  <img className="logo" src="https://dygepqdinth6c.cloudfront.net/octsportslogo.png" alt="" />
              </Link>
          </header>
    );
}
export default Header;
