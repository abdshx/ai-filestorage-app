"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { User, Lock, Bell, Shield, HardDrive, Trash2, Upload, Eye, EyeOff, Save, Camera } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // TODO: Replace with actual user data from Supabase Auth
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/diverse-user-avatars.png",
    plan: "Pro",
    storageUsed: "2.4 GB",
    storageLimit: "10 GB",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    fileSharing: true,
    storageAlerts: true,
  })

  // TODO: Replace with actual profile update function connected to Supabase
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock update delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Updating profile:", profileData)
    // TODO: Implement actual profile update logic here
    // const { data, error } = await supabase.auth.updateUser({
    //   data: { name: profileData.name }
    // })

    setIsLoading(false)
  }

  // TODO: Replace with actual password update function connected to Supabase Auth
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    setIsLoading(true)

    // Mock update delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Updating password")
    // TODO: Implement actual password update logic here
    // const { data, error } = await supabase.auth.updateUser({
    //   password: passwordData.newPassword
    // })

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsLoading(false)
  }

  // TODO: Replace with actual notification settings update
  const handleNotificationUpdate = async (setting: string, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))

    console.log("Updating notification setting:", setting, value)
    // TODO: Implement actual notification settings update
  }

  const storagePercentage =
    (Number.parseFloat(profileData.storageUsed) / Number.parseFloat(profileData.storageLimit)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="border-border bg-transparent">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-accent text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-input border-border pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-input border-border pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-accent text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-pulse" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationUpdate("emailNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationUpdate("pushNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fileSharing">File Sharing Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when files are shared with you</p>
                  </div>
                  <Switch
                    id="fileSharing"
                    checked={notificationSettings.fileSharing}
                    onCheckedChange={(checked) => handleNotificationUpdate("fileSharing", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="storageAlerts">Storage Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when storage is running low</p>
                  </div>
                  <Switch
                    id="storageAlerts"
                    checked={notificationSettings.storageAlerts}
                    onCheckedChange={(checked) => handleNotificationUpdate("storageAlerts", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge className="bg-primary text-primary-foreground">{profileData.plan}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">
                    {profileData.storageUsed} / {profileData.storageLimit}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{storagePercentage.toFixed(1)}% used</p>
              </div>

              <Button variant="outline" className="w-full border-border bg-transparent">
                <Upload className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Appearance</CardTitle>
              <CardDescription>Customize how FileVault looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="text-xs"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="text-xs"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="text-xs"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start border-border bg-transparent">
                <Lock className="mr-2 h-4 w-4" />
                Two-Factor Authentication
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border bg-transparent">
                <HardDrive className="mr-2 h-4 w-4" />
                Download My Data
              </Button>
              <Button variant="destructive" size="sm" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
