"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/lib/types";

const roleStyles: Record<UserRole, string> = {
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  operator: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  viewer: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

const roleLabels: Record<UserRole, string> = {
  admin: "管理员",
  operator: "操作员",
  viewer: "只读用户",
};

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("viewer");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: users, isLoading, refetch } = useApiQuery<User[]>({
    fetcher: () => apiClient.getUsers(),
    refreshInterval: 60000,
  });

  const handleCreate = async () => {
    if (!newUsername.trim()) return;
    setCreating(true);
    try {
      await apiClient.createUser({
        username: newUsername,
        role: newRole,
        email: newEmail,
      });
      setNewUsername("");
      setNewEmail("");
      setNewRole("viewer");
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("确定要删除此用户？")) return;
    setDeletingId(userId);
    try {
      await apiClient.deleteUser(userId);
      refetch();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">RBAC 角色权限管理</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>添加用户</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总用户数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>管理员</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users?.filter((u) => u.role === "admin").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>操作员</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users?.filter((u) => u.role === "operator").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">创建新用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm text-muted-foreground">用户名</label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="输入用户名"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">邮箱</label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="输入邮箱"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">角色</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="viewer">只读用户</option>
                  <option value="operator">操作员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "创建中..." : "创建"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>管理系统用户及其权限</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="ml-auto h-4 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                    {user.username[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email || "无邮箱"}</p>
                  </div>

                  {/* Role */}
                  <Badge variant="outline" className={cn("font-normal", roleStyles[user.role])}>
                    {roleLabels[user.role]}
                  </Badge>

                  {/* Created */}
                  <div className="text-right text-sm text-muted-foreground hidden md:block">
                    创建于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                  >
                    {deletingId === user.id ? "删除中..." : "删除"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>暂无用户</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
