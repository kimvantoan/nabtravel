"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/providers";

export default function AdminLogin() {
  const { dict } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(dict.admin.invalidCreds);
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{dict.admin.loginTitle}</h1>
        <p className="text-center text-gray-500 mb-6">{dict.admin.loginDesc}</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{dict.admin.emailLabel}</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={dict.admin.emailPlaceholder} 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{dict.admin.passwordLabel}</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={dict.admin.passwordPlaceholder} 
              required 
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-[#10a36e] hover:bg-[#0e8a5d]">
            {isLoading ? dict.admin.processingBtn : dict.admin.signInBtn}
          </Button>
        </form>
      </div>
    </div>
  );
}
