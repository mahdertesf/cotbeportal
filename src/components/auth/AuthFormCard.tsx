import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function AuthFormCard({ title, description, children, footerContent }: AuthFormCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <Image 
            src="/cotbe-logo.png" 
            alt="CoTBE Logo" 
            width={52} 
            height={50}
            className="mb-4"
            data-ai-hint="university emblem"
          />
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          {description && <CardDescription className="font-body">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footerContent && (
          <CardFooter className="flex flex-col items-center space-y-2">
            {footerContent}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
