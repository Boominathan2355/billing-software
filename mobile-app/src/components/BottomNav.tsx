import { NavLink } from 'react-router-dom';
import { LuShoppingCart, LuPackage, LuUsers, LuBookOpen, LuActivity, LuUser, LuSettings } from 'react-icons/lu';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
      <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuActivity size={20} />
        <span>Dash</span>
      </NavLink>
      <NavLink to="/billing" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuShoppingCart size={20} />
        <span>Billing</span>
      </NavLink>
      <NavLink to="/inventory" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuPackage size={20} />
        <span>Stock</span>
      </NavLink>
      <NavLink to="/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuUsers size={20} />
        <span>clients</span>
      </NavLink>
      <NavLink to="/books" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuBookOpen size={20} />
        <span>Books</span>
      </NavLink>
      <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuSettings size={20} />
        <span>Settings</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LuUser size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
