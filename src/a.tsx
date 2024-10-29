import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  Copy, 
  Menu,
  Loader2,
  GripVertical,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL ="http://localhost:3001/api";

// Types
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  holdTime: number;
  weight: number;
  side?: 'left' | 'right' | 'both';
}

interface Category {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseTemplate {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  defaultHoldTime: number;
}

const ExerciseProgram = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [programName, setProgramName] = useState('');
  const [therapistNotes, setTherapistNotes] = useState('');
  const [frequency, setFrequency] = useState(1);
  const [saving, setSaving] = useState(false);
  const [breakInterval, setBreakInterval] = useState(30);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryExercises, setCategoryExercises] = useState<ExerciseTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch exercises when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryExercises(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAsCombo = async () => {
    if (!programName) {
      toast({
        title: "Error",
        description: "Please enter a program name",
        variant: "destructive",
      });
      return;
    }
  
    try {
      setSaving(true);
  
      const response = await fetch('http://localhost:3001/api/combos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: programName,
          exercises: setExercises,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save combo');
      }
  
      const savedCombo = await response.json();
      toast({
        title: "Success",
        description: `Saved combo: ${savedCombo.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save combo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  

  const fetchCategoryExercises = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/exercises`);
      if (!response.ok) throw new Error('Failed to fetch exercises');
      const data = await response.json();
      setCategoryExercises(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exercises. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Drop outside the list
    if (!destination) return;

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newExercises = Array.from(exercises);
    const [removed] = newExercises.splice(source.index, 1);
    newExercises.splice(destination.index, 0, removed);

    setExercises(newExercises);
  };

  const addExercise = (templateExercise: ExerciseTemplate) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: templateExercise.name,
      sets: templateExercise.defaultSets,
      reps: templateExercise.defaultReps,
      holdTime: templateExercise.defaultHoldTime,
      weight: 0,
      side: 'both'
    };

    setExercises([...exercises, newExercise]);
  };

  const duplicateExercise = (exercise: Exercise, index: number) => {
    if (exercise.side === 'both') return;
    
    const newExercise = {
      ...exercise,
      id: `${exercise.id}-${Date.now()}`,
      side: exercise.side === 'left' ? 'right' : 'left'
    };
    
    const newExercises = [...exercises];
    newExercises.splice(index + 1, 0, newExercise);
    setExercises(newExercises);
  };

  const saveProgram = async () => {
    if (!programName) {
      toast({
        title: "Error",
        description: "Please enter a program name",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/combos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: programName,
          exercises,
          frequency,
          breakInterval,
          selectedDays,
          therapistNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save program');

      toast({
        title: "Success",
        description: "Program saved successfully"
      });

      // Clear form
      setProgramName('');
      setExercises([]);
      setTherapistNotes('');
      setFrequency(1);
      setBreakInterval(30);
      setSelectedDays([]);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save program. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="programme-name">Programme Name</Label>
          <Input 
            id="programme-name" 
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Knee Rehab Programme" 
          />
        </div>
        
        <div className="flex-1">
          <Label>Category</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Available Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => addExercise(exercise)}
                >
                  <Plus className="h-4 w-4" />
                  <span>{exercise.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {exercises.map((exercise, index) => (
                <Draggable
                  key={exercise.id}
                  draggableId={exercise.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4" />
                        
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <Input 
                          value={exercise.name}
                          onChange={(e) => {
                            const newExercises = [...exercises];
                            newExercises[index].name = e.target.value;
                            setExercises(newExercises);
                          }}
                          className="font-semibold"
                        />
                        
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                          <div>
                            <Label>Sets</Label>
                            <Input 
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].sets = parseInt(e.target.value) || 0;
                                setExercises(newExercises);
                              }}
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <Label>Reps</Label>
                            <Input 
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].reps = parseInt(e.target.value) || 0;
                                setExercises(newExercises);
                              }}
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <Label>Hold (s)</Label>
                            <Input 
                              type="number"
                              value={exercise.holdTime}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].holdTime = parseInt(e.target.value) || 0;
                                setExercises(newExercises);
                              }}
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <Label>Weight (kg)</Label>
                            <Input 
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].weight = parseInt(e.target.value) || 0;
                                setExercises(newExercises);
                              }}
                              min="0"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label>Side</Label>
                            <Select
                              value={exercise.side}
                              onValueChange={(value: 'left' | 'right' | 'both') => {
                                const newExercises = [...exercises];
                                newExercises[index].side = value;
                                setExercises(newExercises);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Side" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Menu className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => duplicateExercise(exercise, index)}
                            disabled={exercise.side === 'both'}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate for other side
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const newExercises = [...exercises];
                              newExercises.splice(index, 1);
                              setExercises(newExercises);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Break Interval</Label>
          <div className="flex items-center space-x-2">
            <Input 
              type="number"
              value={breakInterval}
              onChange={(e) => setBreakInterval(parseInt(e.target.value) || 30)}
              className="w-20"
              min="0"
            />
            <span>seconds</span>
          </div>
        </div>
        
        <div className="flex-1">
          <Label>Daily Frequency</Label>
          <div className="flex items-center space-x-2">
            <Input 
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value) || 1)}
              className="w-20"
              min="1"
            />
            <span>sessions/day</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Days of Week</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['S', 'M', 'T', 'W', 'TH', 'F', 'Sa'].map((day) => (
            <Button
              key={day}
              variant={selectedDays.includes(day) ? "default" : "outline"}
              className="w-10 h-10"
              onClick={() => {
                setSelectedDays(
                  selectedDays.includes(day)
                    ? selectedDays.filter(d => d !== day)
                    : [...selectedDays, day]
                );
              }}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Therapist Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={therapistNotes}
            onChange={(e) => setTherapistNotes(e.target.value)}
            placeholder="Add notes"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveProgram}
          disabled={loading || !programName}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Program'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExerciseProgram;

function setSaving(arg0: boolean) {
  throw new Error('Function not implemented.');
}
