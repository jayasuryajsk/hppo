"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Settings } from "lucide-react"
import { TenderMetadata } from "@/components/custom/TenderMetadata"
import { NotesList } from "@/components/custom/NotesList"
import { AIAssistant } from "@/components/custom/AIAssistant"

export default function TenderWriterApp() {
  const [tenderTitle, setTenderTitle] = useState("")
  const [tenderContent, setTenderContent] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-[15px] font-medium text-gray-800">{tenderTitle || "Untitled Tender"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <TenderMetadata />
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Notes & Sources */}
        <div className="border-r bg-white w-[360px] relative">
          <div>
            <div className="flex items-center h-12 px-4 border-b">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8 bg-gray-100 p-1 gap-1">
                  <TabsTrigger
                    value="notes"
                    className="text-[13px] h-6 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="sources"
                    className="text-[13px] h-6 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    Sources
                  </TabsTrigger>
                  <TabsTrigger
                    value="sections"
                    className="text-[13px] h-6 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    Sections
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <NotesList />
          </div>
        </div>

        {/* Middle - Tender Composer */}
        <div className="bg-white flex flex-col h-full flex-grow border-r">
          <div className="flex items-center h-14 px-6 border-b bg-blue-50">
            <span className="text-sm text-blue-700 font-medium">Tender Composer</span>
          </div>
          <div className="flex flex-col flex-grow p-6 space-y-6 overflow-auto">
            <Input
              type="text"
              placeholder="Tender Title"
              className="text-3xl font-semibold border-none bg-transparent focus-visible:ring-0 p-0 -ml-0.5 text-gray-800 placeholder-gray-400"
              value={tenderTitle}
              onChange={(e) => setTenderTitle(e.target.value)}
            />
            <div className="flex items-center gap-2 py-2 border-y border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="font-semibold">B</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="italic">I</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="font-semibold">H₁</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="font-semibold">H₂</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="font-semibold">H₃</span>
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>•</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>1.</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>{`<>`}</span>
              </Button>
            </div>
            <Textarea
              placeholder="Start writing your tender proposal..."
              className="flex-grow text-base border-none resize-none focus-visible:ring-0 p-0 -ml-0.5 text-gray-700 placeholder-gray-400"
              value={tenderContent}
              onChange={(e) => setTenderContent(e.target.value)}
            />
          </div>
        </div>

        {/* Right Sidebar - AI Assistant */}
        <AIAssistant className="w-[400px]" />
      </div>
    </div>
  )
} 