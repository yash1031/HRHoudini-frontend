"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Company {
  id: string
  name: string
  industry: string
  size: string
  description: string
}

interface Persona {
  id: string
  name: string
  role: string
  company_size: string
  description: string
}

interface DemoScenario {
  id: string
  name: string
  description: string
  company_id: string
  target_personas: string[]
  config: any
  is_active: boolean
  company_name?: string
  company?: Company
  persona?: Persona
  core_needs?: any
  user_journey?: any
  value_delivered?: any
  url?: string
}

interface ScenarioBuilderProps {
  companies: Company[]
  personas: Persona[]
  onScenarioChange: () => void
  editingScenario?: DemoScenario
  triggerButton?: React.ReactNode
}

export function ScenarioBuilder({
  companies,
  personas,
  onScenarioChange,
  editingScenario,
  triggerButton,
}: ScenarioBuilderProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [scenarioName, setScenarioName] = useState("")
  const [scenarioDescription, setScenarioDescription] = useState("")
  const [scenarioUrl, setScenarioUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [coreNeeds, setCoreNeeds] = useState<string[]>([])
  const [newNeedText, setNewNeedText] = useState("")
  const [editingNeedIndex, setEditingNeedIndex] = useState<number | null>(null)
  const [editingNeedText, setEditingNeedText] = useState("")
  const [userJourneySteps, setUserJourneySteps] = useState<string[]>([])
  const [newJourneyStepText, setNewJourneyStepText] = useState("")
  const [editingJourneyStepIndex, setEditingJourneyStepIndex] = useState<number | null>(null)
  const [editingJourneyStepText, setEditingJourneyStepText] = useState("")
  const [coreNeedsOpen, setCoreNeedsOpen] = useState(false)
  const [userJourneyOpen, setUserJourneyOpen] = useState(false)
  const [valueDelivered, setValueDelivered] = useState<Array<{ category: string; description: string }>>([])
  const [newValueCategory, setNewValueCategory] = useState("")
  const [newValueDescription, setNewValueDescription] = useState("")
  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(null)
  const [editingValueCategory, setEditingValueCategory] = useState("")
  const [editingValueDescription, setEditingValueDescription] = useState("")
  const [valueDeliveredOpen, setValueDeliveredOpen] = useState(false)

  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const handleCreateScenario = async () => {
    if (!selectedCompany || !selectedPersona || !scenarioName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const personaObj = personas.find((p) => p.id === selectedPersona)
      const targetPersonas = personaObj ? [personaObj.name] : []

      const response = await fetch("/api/demo/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scenarioName,
          description: scenarioDescription,
          company_id: selectedCompany,
          target_personas: targetPersonas,
          core_needs: coreNeeds,
          user_journey: userJourneySteps,
          value_delivered: valueDelivered,
          url: scenarioUrl,
          config: {},
          is_active: true,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Demo scenario created successfully",
        })
        resetForm()
        onScenarioChange()
        setIsDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create scenario")
      }
    } catch (error) {
      console.error("Error creating scenario:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create demo scenario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateScenario = async () => {
    if (!editingScenario) return

    setIsLoading(true)
    try {
      const personaObj = personas.find((p) => p.id === selectedPersona)
      const targetPersonas = personaObj ? [personaObj.name] : []

      const response = await fetch("/api/demo/scenarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingScenario.id,
          name: scenarioName,
          description: scenarioDescription,
          company_id: selectedCompany,
          target_personas: targetPersonas,
          core_needs: coreNeeds,
          user_journey: userJourneySteps,
          value_delivered: valueDelivered,
          url: scenarioUrl,
          config: editingScenario.config,
          is_active: editingScenario.is_active,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Demo scenario updated successfully",
        })
        resetForm()
        onScenarioChange()
        setIsDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update scenario")
      }
    } catch (error) {
      console.error("Error updating scenario:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update demo scenario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCompany("")
    setSelectedPersona("")
    setScenarioName("")
    setScenarioDescription("")
    setScenarioUrl("")
    setCoreNeeds([])
    setNewNeedText("")
    setEditingNeedIndex(null)
    setEditingNeedText("")
    setUserJourneySteps([])
    setNewJourneyStepText("")
    setEditingJourneyStepIndex(null)
    setEditingJourneyStepText("")
    setValueDelivered([])
    setNewValueCategory("")
    setNewValueDescription("")
    setEditingValueIndex(null)
    setEditingValueCategory("")
    setEditingValueDescription("")
  }

  const openEditDialog = () => {
    if (editingScenario) {
      setSelectedCompany(editingScenario.company_id)
      setSelectedPersona(personas.find((p) => p.name === editingScenario.target_personas[0])?.id || "")
      setScenarioName(editingScenario.name)
      setScenarioDescription(editingScenario.description)
      setScenarioUrl(editingScenario.url || "")

      // Load core needs and journey steps from database fields
      try {
        const coreNeedsData = editingScenario.core_needs || []
        const journeyStepsData = editingScenario.user_journey || []
        const valueDeliveredData = editingScenario.value_delivered || []

        setCoreNeeds(Array.isArray(coreNeedsData) ? coreNeedsData : [])
        setUserJourneySteps(Array.isArray(journeyStepsData) ? journeyStepsData : [])
        setValueDelivered(Array.isArray(valueDeliveredData) ? valueDeliveredData : [])
      } catch (error) {
        console.error("Error loading scenario data:", error)
        setCoreNeeds([])
        setUserJourneySteps([])
        setValueDelivered([])
      }
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleAddNeed = () => {
    if (newNeedText.trim()) {
      setCoreNeeds((prev) => [...prev, newNeedText.trim()])
      setNewNeedText("")
    } else {
      toast({
        title: "Input Required",
        description: "Please enter a core need.",
        variant: "destructive",
      })
    }
  }

  const handleEditNeed = (index: number) => {
    setEditingNeedIndex(index)
    setEditingNeedText(coreNeeds[index])
  }

  const handleUpdateNeed = () => {
    if (editingNeedIndex !== null && editingNeedText.trim()) {
      setCoreNeeds((prev) => prev.map((need, i) => (i === editingNeedIndex ? editingNeedText.trim() : need)))
      setEditingNeedIndex(null)
      setEditingNeedText("")
    } else if (editingNeedIndex !== null && !editingNeedText.trim()) {
      handleDeleteNeed(editingNeedIndex)
      setEditingNeedIndex(null)
      setEditingNeedText("")
    }
  }

  const handleDeleteNeed = (index: number) => {
    setCoreNeeds((prev) => prev.filter((_, i) => i !== index))
    if (editingNeedIndex === index) {
      setEditingNeedIndex(null)
      setEditingNeedText("")
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index
  }

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return

    const newCoreNeeds = [...coreNeeds]
    const draggedContent = newCoreNeeds[dragItem.current]
    newCoreNeeds.splice(dragItem.current, 1)
    newCoreNeeds.splice(dragOverItem.current, 0, draggedContent)

    setCoreNeeds(newCoreNeeds)
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleAddJourneyStep = () => {
    if (newJourneyStepText.trim()) {
      setUserJourneySteps((prev) => [...prev, newJourneyStepText.trim()])
      setNewJourneyStepText("")
    } else {
      toast({
        title: "Input Required",
        description: "Please enter a journey step.",
        variant: "destructive",
      })
    }
  }

  const handleEditJourneyStep = (index: number) => {
    setEditingJourneyStepIndex(index)
    setEditingJourneyStepText(userJourneySteps[index])
  }

  const handleUpdateJourneyStep = () => {
    if (editingJourneyStepIndex !== null && editingJourneyStepText.trim()) {
      setUserJourneySteps((prev) =>
        prev.map((step, i) => (i === editingJourneyStepIndex ? editingJourneyStepText.trim() : step)),
      )
      setEditingJourneyStepIndex(null)
      setEditingJourneyStepText("")
    } else if (editingJourneyStepIndex !== null && !editingJourneyStepText.trim()) {
      handleDeleteJourneyStep(editingJourneyStepIndex)
      setEditingJourneyStepIndex(null)
      setEditingJourneyStepText("")
    }
  }

  const handleDeleteJourneyStep = (index: number) => {
    setUserJourneySteps((prev) => prev.filter((_, i) => i !== index))
    if (editingJourneyStepIndex === index) {
      setEditingJourneyStepIndex(null)
      setEditingJourneyStepText("")
    }
  }

  const handleJourneyStepDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index
    e.dataTransfer.effectAllowed = "move"
  }

  const handleJourneyStepDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index
  }

  const handleJourneyStepDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return

    const newJourneySteps = [...userJourneySteps]
    const draggedContent = newJourneySteps[dragItem.current]
    newJourneySteps.splice(dragItem.current, 1)
    newJourneySteps.splice(dragOverItem.current, 0, draggedContent)

    setUserJourneySteps(newJourneySteps)
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleAddValue = () => {
    if (newValueCategory && newValueDescription.trim()) {
      setValueDelivered((prev) => [...prev, { category: newValueCategory, description: newValueDescription.trim() }])
      setNewValueCategory("")
      setNewValueDescription("")
    } else {
      toast({
        title: "Input Required",
        description: "Please select a category and enter a description.",
        variant: "destructive",
      })
    }
  }

  const handleEditValue = (index: number) => {
    setEditingValueIndex(index)
    setEditingValueCategory(valueDelivered[index].category)
    setEditingValueDescription(valueDelivered[index].description)
  }

  const handleUpdateValue = () => {
    if (editingValueIndex !== null && editingValueCategory && editingValueDescription.trim()) {
      setValueDelivered((prev) =>
        prev.map((value, i) =>
          i === editingValueIndex
            ? { category: editingValueCategory, description: editingValueDescription.trim() }
            : value,
        ),
      )
      setEditingValueIndex(null)
      setEditingValueCategory("")
      setEditingValueDescription("")
    } else if (editingValueIndex !== null && (!editingValueCategory || !editingValueDescription.trim())) {
      handleDeleteValue(editingValueIndex)
      setEditingValueIndex(null)
      setEditingValueCategory("")
      setEditingValueDescription("")
    }
  }

  const handleDeleteValue = (index: number) => {
    setValueDelivered((prev) => prev.filter((_, i) => i !== index))
    if (editingValueIndex === index) {
      setEditingValueIndex(null)
      setEditingValueCategory("")
      setEditingValueDescription("")
    }
  }

  const handleValueDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index
    e.dataTransfer.effectAllowed = "move"
  }

  const handleValueDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index
  }

  const handleValueDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return

    const newValueDelivered = [...valueDelivered]
    const draggedContent = newValueDelivered[dragItem.current]
    newValueDelivered.splice(dragItem.current, 1)
    newValueDelivered.splice(dragOverItem.current, 0, draggedContent)

    setValueDelivered(newValueDelivered)
    dragItem.current = null
    dragOverItem.current = null
  }

  const defaultTrigger = (
    <Button onClick={openEditDialog}>
      <Plus className="w-4 h-4 mr-2" />
      Scenario Builder
    </Button>
  )

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {triggerButton ? <div onClick={openEditDialog}>{triggerButton}</div> : defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingScenario ? "Edit Demo Scenario" : "Scenario Builder"}</DialogTitle>
          <DialogDescription>
            Configure a demo scenario by selecting a company and persona combination.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} ({company.industry})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona">Persona</Label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.name} ({persona.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Scenario Name</Label>
            <Input
              id="name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              placeholder="Describe this demo scenario"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Scenario URL</Label>
            <Input
              id="url"
              value={scenarioUrl}
              onChange={(e) => setScenarioUrl(e.target.value)}
              placeholder="Enter the URL for the Run button (e.g., /onboarding?name=Maya+Jackson&email=...)"
            />
          </div>
          <Collapsible open={coreNeedsOpen} onOpenChange={setCoreNeedsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <Label htmlFor="core-needs" className="text-base font-medium">
                  Core Needs ({coreNeeds.length})
                </Label>
                {coreNeedsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="flex space-x-2">
                <Input
                  id="new-need"
                  placeholder="Add a new core need"
                  value={newNeedText}
                  onChange={(e) => setNewNeedText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddNeed()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddNeed}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {coreNeeds.map((need, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50 cursor-grab"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {editingNeedIndex === index ? (
                      <Input
                        value={editingNeedText}
                        onChange={(e) => setEditingNeedText(e.target.value)}
                        onBlur={handleUpdateNeed}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateNeed()
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1">{need}</span>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNeed(index)}
                        disabled={editingNeedIndex === index}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNeed(index)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible open={userJourneyOpen} onOpenChange={setUserJourneyOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <Label htmlFor="user-journey" className="text-base font-medium">
                  User Journey ({userJourneySteps.length})
                </Label>
                {userJourneyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="flex space-x-2">
                <Input
                  id="new-journey-step"
                  placeholder="Add a new journey step"
                  value={newJourneyStepText}
                  onChange={(e) => setNewJourneyStepText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddJourneyStep()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddJourneyStep}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {userJourneySteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50 cursor-grab"
                    draggable
                    onDragStart={(e) => handleJourneyStepDragStart(e, index)}
                    onDragEnter={(e) => handleJourneyStepDragEnter(e, index)}
                    onDragEnd={handleJourneyStepDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="font-medium text-sm text-gray-500 min-w-[20px]">{index + 1}.</span>
                      {editingJourneyStepIndex === index ? (
                        <Input
                          value={editingJourneyStepText}
                          onChange={(e) => setEditingJourneyStepText(e.target.value)}
                          onBlur={handleUpdateJourneyStep}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateJourneyStep()
                            }
                          }}
                          autoFocus
                          className="flex-1"
                        />
                      ) : (
                        <span className="flex-1">{step}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJourneyStep(index)}
                        disabled={editingJourneyStepIndex === index}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteJourneyStep(index)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible open={valueDeliveredOpen} onOpenChange={setValueDeliveredOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <Label htmlFor="value-delivered" className="text-base font-medium">
                  Value Delivered ({valueDelivered.length})
                </Label>
                {valueDeliveredOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="flex space-x-2">
                <Select value={newValueCategory} onValueChange={setNewValueCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accelerated Analysis">Accelerated Analysis</SelectItem>
                    <SelectItem value="Decision Confidence">Decision Confidence</SelectItem>
                    <SelectItem value="Strategic Insights">Strategic Insights</SelectItem>
                    <SelectItem value="Trusted Partnership">Trusted Partnership</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="new-value-description"
                  placeholder="Enter value description"
                  value={newValueDescription}
                  onChange={(e) => setNewValueDescription(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddValue()
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddValue}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {valueDelivered.map((value, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50 cursor-grab"
                    draggable
                    onDragStart={(e) => handleValueDragStart(e, index)}
                    onDragEnter={(e) => handleValueDragEnter(e, index)}
                    onDragEnd={handleValueDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {editingValueIndex === index ? (
                        <div className="flex space-x-2 flex-1">
                          <Select value={editingValueCategory} onValueChange={setEditingValueCategory}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Accelerated Analysis">Accelerated Analysis</SelectItem>
                              <SelectItem value="Decision Confidence">Decision Confidence</SelectItem>
                              <SelectItem value="Strategic Insights">Strategic Insights</SelectItem>
                              <SelectItem value="Trusted Partnership">Trusted Partnership</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={editingValueDescription}
                            onChange={(e) => setEditingValueDescription(e.target.value)}
                            onBlur={handleUpdateValue}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateValue()
                              }
                            }}
                            autoFocus
                            className="flex-1"
                          />
                        </div>
                      ) : (
                        <div className="flex space-x-3 flex-1">
                          <span className="font-medium text-sm text-blue-600 min-w-[140px]">{value.category}:</span>
                          <span className="flex-1">{value.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditValue(index)}
                        disabled={editingValueIndex === index}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteValue(index)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingScenario ? handleUpdateScenario : handleCreateScenario} disabled={isLoading}>
              {isLoading ? "Saving..." : editingScenario ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
