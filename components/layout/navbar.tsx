'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { useMounted } from '@/lib/hooks/use-mounted';
import {
  Calendar,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  UserCheck,
  Wifi
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const mounted = useMounted();
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/eventos', label: 'Events', icon: Calendar },
    ...(mounted && isAuthenticated ? [
      { href: '/orders', label: 'My Orders', icon: ShoppingCart },
      { href: '/test-websocket', label: 'WebSocket Test', icon: Wifi },
      ...(isOrganizer ? [
        { href: '/eventos/create', label: 'Create Event', icon: Plus }
      ] : [])
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Event Platform
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu and WebSocket status */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* WebSocket status indicator */}
            {mounted && isAuthenticated && (
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="ml-2 text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            )}

            {mounted && isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User info */}
                <div className="flex items-center text-sm text-gray-700">
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span>{user?.username}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {user?.role}
                  </span>
                </div>

                {/* Profile link */}
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </Link>
                </Button>

                {/* Logout button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href="/user/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                >
                  <Link href="/user/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {mounted && isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-800">{user?.username}</div>
                  <div className="text-sm text-gray-500">{user?.role}</div>
                  <div className="flex items-center mt-1">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="ml-2 text-xs text-gray-500">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/user/login"
                  className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/user/register"
                  className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}