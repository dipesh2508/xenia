'use client'
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import React from 'react'

const page = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Button onClick={() => alert('Hello World')}>
        Click Me
      </Button>

      <div className="bg-red-200 p-4">
        hello box
      </div>

      <Card className="w-64 shadow-2xl">
        Card content
      </Card>
    </div>
  )
}

export default page