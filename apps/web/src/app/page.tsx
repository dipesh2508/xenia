'use client'
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardTitle, CardContent } from "@repo/ui/components/ui/card";
import React from 'react'

const page = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Button onClick={() => alert('Hello World')}>
        Click Me
      </Button>

      <Card className="w-64 shadow-2xl">
        <CardTitle>
          Card Title
        </CardTitle>
        <CardContent>
          Card Content
        </CardContent>
      </Card>
    </div>
  )
}

export default page