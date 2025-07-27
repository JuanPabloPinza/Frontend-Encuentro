'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import Link from "next/link"

export function NavBarComponent() {
    const { user, logout, isAuthenticated, isLoading } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    return (
        <nav className="flex py-5 justify-center border-b border-gray-200">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-sm hover:text-blue-600">
                    Eventos
                </Link>
                
                {isAuthenticated && (
                    <>
                        <Link href="/profile" className="text-sm hover:text-blue-600">
                            Perfil
                        </Link>
                        <Link href="/mis-compras" className="text-sm hover:text-blue-600">
                            Mis Compras
                        </Link>
                    </>
                )}

                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <div className="text-sm text-gray-500">Loading...</div>
                    ) : isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-700">
                                Welcome, {user?.email}
                            </span>
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/user/register">
                                <Button variant="outline">Registrarse</Button>
                            </Link>
                            <Link href="/user/login">
                                <Button>Iniciar Sesión</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}