"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  LogOut,
  Edit,
  Camera,
  BarChart3
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userStats = [
    { label: "Crops Monitored", value: "24", icon: BarChart3 },
    { label: "AI Scans", value: "156", icon: Camera },
    { label: "Health Score", value: "85%", icon: Shield },
  ];

  const profileSections = [
    {
      title: "Account Settings",
      icon: Settings,
      description: "Manage your account preferences",
      href: "/profile/settings"
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure alerts and notifications",
      href: "/profile/notifications"
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      description: "Manage privacy settings and security",
      href: "/profile/privacy"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        {/* Profile Header */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          {/* Profile Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name || "CropAI User"}</h2>
                  <p className="text-gray-600">{user?.email || "user@example.com"}</p>
                  <Badge variant="secondary" className="mt-2">
                    Premium Farmer
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined Nov 2024</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Maharashtra, India</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {userStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <stat.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Sections */}
          <div className="space-y-3">
            {profileSections.map((section) => (
              <Card key={section.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <section.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Logout Button */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}