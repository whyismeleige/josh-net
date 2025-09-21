"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export default function ChangePassword() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Change Your Password</CardTitle>
        <CardDescription>Enter Your New Password</CardDescription>
      </CardHeader>
    </Card>
  );
}
