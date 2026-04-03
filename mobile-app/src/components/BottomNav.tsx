import { NavLink } from 'react-router-dom';
import { ShoppingCart, Package, Users, BookOpen, Activity, User, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
      <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Activity size={20} />
        <span>Dash</span>
      </NavLink>
      <NavLink to="/billing" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingCart size={20} />
        <span>Billing</span>
      </NavLink>
      <NavLink to="/inventory" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={20} />
        <span>Stock</span>
      </NavLink>
      <NavLink to="/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={20} />
        <span>clients</span>
      </NavLink>
      <NavLink to="/books" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={20} />
        <span>Books</span>
      </NavLink>
      <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
