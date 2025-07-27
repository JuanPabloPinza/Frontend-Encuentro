'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMounted } from '@/lib/hooks/use-mounted';
import { 
  Calendar, 
  Users, 
  Ticket, 
  Zap, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const mounted = useMounted();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage events with multiple ticket categories and real-time availability tracking.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'WebSocket-powered real-time ticket availability and instant order notifications.'
    },
    {
      icon: Ticket,
      title: 'Smart Ticketing',
      description: 'Advanced ticket locking system prevents double bookings and ensures fair purchasing.'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Role-based access control with JWT authentication for organizers and attendees.'
    },
    {
      icon: Users,
      title: 'Multi-role Support',
      description: 'Different interfaces for event organizers and ticket purchasers with appropriate permissions.'
    },
    {
      icon: Clock,
      title: 'Order Management',
      description: 'Complete order lifecycle management with status tracking and cancellation options.'
    }
  ];

  const stats = [
    { label: 'Events Created', value: '1000+' },
    { label: 'Tickets Sold', value: '50K+' },
    { label: 'Happy Users', value: '5K+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Event Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            A comprehensive event management platform with real-time ticketing, 
            WebSocket integration, and advanced booking capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!mounted ? (
              // Show loading state to prevent hydration mismatch
              <div className="flex gap-4">
                <div className="h-11 w-32 bg-white/20 rounded-md animate-pulse" />
                <div className="h-11 w-24 bg-white/20 rounded-md animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/eventos')}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {user?.role === 'organizer' && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/eventos/create')}
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Create Event
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/user/register')}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/user/login')}
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage events and sell tickets with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Simple steps to get started with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account as an organizer or attendee to get started
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Create or Browse</h3>
              <p className="text-gray-600">
                Organizers can create events while attendees can browse and discover
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Experience</h3>
              <p className="text-gray-600">
                Enjoy real-time updates and secure ticket purchasing with live availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600">
              Powered by cutting-edge technologies for performance and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  Frontend Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Next.js 15 with App Router</li>
                  <li>• React 19 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Socket.IO for real-time features</li>
                  <li>• Zustand for state management</li>
                  <li>• React Hook Form with Zod validation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  Backend Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• NestJS microservices architecture</li>
                  <li>• JWT authentication system</li>
                  <li>• PostgreSQL database</li>
                  <li>• RabbitMQ message queuing</li>
                  <li>• WebSocket real-time communication</li>
                  <li>• RESTful API endpoints</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users already using our platform
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push('/user/register')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/user/login')}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
