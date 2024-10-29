import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  ChevronDown,
  Mail,
  Minus,
  Dumbbell,
  Watch,
  Scale,
  Bell,
  Waves,
  Bed,
  User,
  ArrowRight,
  Timer,
  UserCircle2,
  X
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = "http://localhost:3001/api";

type Equipment = 'dumbbell' | 'bodyweight' | 'machine';
type Side = 'left' | 'right' | 'both';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  holdTime: number;
  weight: number;
  side: Side;
  stage: string;
  equipment: Equipment;
}

const equipmentIcons: Record<Equipment, React.FC> = {
  dumbbell: Dumbbell,
  bodyweight: Scale,
  machine: Watch,
};

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
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
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

  const clearAll = () => {
    setProgramName('');
    setSelectedCategory('');
    setExercises([]);
    setTherapistNotes('');
    setFrequency(1);
    setBreakInterval(30);
    setSelectedDays([]);
    setSelectedEquipment([]);
  };

  {/*dumbell resistance band part */ }
  const ExerciseTracker = () => {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="bg-white rounded-lg">
            <div className="flex space-x-4 mb-4">
              <EquipmentIcon icon={<Dumbbell className="w-6 h-6" />} label="Dumbbell" />
              <EquipmentIcon icon={<Bell className="w-6 h-6" />} label="Kettlebell" />
              <EquipmentIcon icon={<Waves className="w-6 h-6" />} label="Resistance Band" />
            </div>

            <div className="flex space-x-2 mb-4">
              <Tag label="Lower limb strengthening 1" />
              <Tag label="Static standing balance" />
            </div>

            <div className="flex space-x-4">
              <PositionIcon icon={<Bed className="w-6 h-6" />} label="Bed" color="text-red-500" />
              <PositionIcon icon={<User className="w-6 h-6" />} label="Front" color="text-blue-500" />
              <PositionIcon icon={<ArrowRight className="w-6 h-6" />} label="Side" color="text-cyan-500" />
              <PositionIcon icon={<Timer className="w-6 h-6" />} label="Manual Rep Count" color="text-yellow-500" />
              <PositionIcon icon={<UserCircle2 className="w-6 h-6" />} label="Non AI" color="text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EquipmentIcon = ({ icon, label }) => {
    return (
      <div className="flex flex-col items-center">
        <div className="text-blue-500 mb-1">{icon}</div>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    );
  };

  const Tag = ({ label }) => {
    return (
      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
        {label}
        <X className="w-4 h-4 ml-2 cursor-pointer" />
      </div>
    );
  };

  const PositionIcon = ({ icon, label, color }) => {
    return (
      <div className="flex flex-col items-center">
        <div className={`${color} mb-1`}>{icon}</div>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    );
  };



  {/*dumbell resistance band part end */ }

  

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setExercises(items);
  };

  const updateExerciseValue = (
    index: number,
    field: keyof Exercise,
    value: number | string
  ) => {
    const newExercises = [...exercises];
    if (typeof value === 'number' && value >= 0) {
      newExercises[index] = {
        ...newExercises[index],
        [field]: value,
      };
      setExercises(newExercises);
    } else if (typeof value === 'string') {
      newExercises[index] = {
        ...newExercises[index],
        [field]: value,
      };
      setExercises(newExercises);
    }
  };

  const createNewExercise = (): Exercise => ({
    id: Date.now().toString(),
    name: '',
    sets: 0,
    reps: 0,
    holdTime: 0,
    weight: 0,
    side: 'both',
    stage: 'Stage 1',
    equipment: 'bodyweight',
  });

  const duplicateExercise = (exercise: Exercise, index: number) => {
    const newExercise: Exercise = {
      ...exercise,
      id: `${exercise.id}-${Date.now()}`,
      side: exercise.side === 'left' ? 'right' : 'left',
    };
    const newExercises = [...exercises];
    newExercises.splice(index + 1, 0, newExercise);
    setExercises(newExercises);
  };

  const addNewExercise = () => {
    setExercises([...exercises, createNewExercise()]);
  };

  const addExercise = (templateExercise: ExerciseTemplate) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: templateExercise.name,
      sets: templateExercise.defaultSets,
      reps: templateExercise.defaultReps,
      holdTime: templateExercise.defaultHoldTime,
      weight: 0,
      side: 'both',
      stage: 'Stage 1',
      equipment: 'bodyweight',
    };

    setExercises([...exercises, newExercise]);
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

      clearAll();
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

  const renderExerciseCard = (exercise: Exercise, index: number, provided: any) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg shadow"
    >
      <div {...provided.dragHandleProps}>
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Exercise content */}
      <div className="flex-1 space-y-4">
        {/* Exercise header */}
        <div className="flex items-center justify-between mb-4">
          {/* Exercise name */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded">
              <Mail className="text-blue-600 w-5 h-5" />
            </div>
            <Input
              value={exercise.name}
              onChange={(e) => updateExerciseValue(index, 'name', e.target.value)}
              className="font-semibold text-lg"
            />
          </div>

          {/* Side selection buttons */}
          <div className="flex space-x-2">
            {(['left', 'right', 'both'] as const).map((side) => (
              <Button
                key={side}
                variant={exercise.side === side ? "default" : "outline"}
                className={exercise.side === side ? "bg-blue-600 text-white" : "border-blue-600 text-blue-600"}
                onClick={() => updateExerciseValue(index, 'side', side)}
              >
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Exercise details grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 space-y-3">
          {/* Sets, Reps, Hold Time inputs */}
          {(['sets', 'reps', 'holdTime'] as const).map((field) => (
            <div key={field}>
              <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseValue(index, field, Math.max(0, exercise[field] - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={exercise[field]}
                  onChange={(e) => updateExerciseValue(index, field, parseInt(e.target.value) || 0)}
                  className="w-full mx-2 text-center"
                  min="0"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseValue(index, field, exercise[field] + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Weight input with equipment selector */}
          <div>
            <Label>Weight</Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateExerciseValue(index, 'weight', Math.max(0, exercise.weight - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={exercise.weight}
                onChange={(e) => updateExerciseValue(index, 'weight', parseInt(e.target.value) || 0)}
                className="w-full mx-2 text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateExerciseValue(index, 'weight', exercise.weight + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    {React.createElement(equipmentIcons[exercise.equipment], { className: "h-4 w-4" })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(Object.keys(equipmentIcons) as Equipment[]).map((key) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => updateExerciseValue(index, 'equipment', key)}
                    >
                      {React.createElement(equipmentIcons[key], { className: "mr-2 h-4 w-4" })}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stage selector */}
          <div>
            <Label>Stage</Label>
            <Select
              value={exercise.stage}
              onValueChange={(value) => updateExerciseValue(index, 'stage', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stage 1">Stage 1</SelectItem>
                <SelectItem value="Stage 2">Stage 2</SelectItem>
                <SelectItem value="Stage 3">Stage 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>


    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="program-name">Programme Name</Label>
          <Input
            id="program-name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Knee Rehab Programme"
            className="bg-white"
          />
        </div>

        <div className="flex-1">
          <Label>Exercise Combo</Label>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white flex-1">
                <SelectValue placeholder="Select Combo" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <ExerciseTracker />


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



      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exercise Programme</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-2 rounded-md">
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
                            className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg shadow"
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-blue-100 p-2 rounded">
                                    <Mail className="text-blue-600 w-5 h-5" />
                                  </div>
                                  <Input
                                    value={exercise.name}
                                    onChange={(e) => updateExerciseValue(index, 'name', e.target.value)}
                                    className="font-semibold text-lg"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant={exercise.side === 'left' ? "default" : "outline"}
                                    className={exercise.side === 'left' ? "bg-blue-600 text-white" : "border-blue-600 text-blue-600"}
                                    onClick={() => updateExerciseValue(index, 'side', 'left' as Side)}
                                  >
                                    Left
                                  </Button>
                                  <Button
                                    variant={exercise.side === 'right' ? "default" : "outline"}
                                    className={exercise.side === 'right' ? "bg-blue-600 text-white" : "border-blue-600 text-blue-600"}
                                    onClick={() => updateExerciseValue(index, 'side', 'right' as Side)}
                                  >
                                    Right
                                  </Button>
                                  <Button
                                    variant={exercise.side === 'both' ? "default" : "outline"}
                                    className={exercise.side === 'both' ? "bg-blue-600 text-white" : "border-blue-600 text-blue-600"}
                                    onClick={() => updateExerciseValue(index, 'side', 'both' as Side)}
                                  >
                                    Both
                                  </Button>
                                  <Button 
                                    onClick={() => duplicateExercise(exercise, index)}
                                    disabled={exercise.side === 'both'}
                                  >
                                    <Copy className="mr-2 h-4 w-4 rounded-full" />
                                    Duplicate 
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const newExercises = [...exercises];
                                      newExercises.splice(index, 1);
                                      setExercises(newExercises);
                                    }}
                                  >
                                    <Trash2 className="mr-1 h-3 w-1" />
                                    
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {(['sets', 'reps', 'holdTime'] as const).map((field) => (
                                  <div key={field}>
                                    <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                                    <div className="flex items-center">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => updateExerciseValue(index, field, exercise[field] - 1)}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <Input
                                        type="number"
                                        value={exercise[field]}
                                        onChange={(e) => updateExerciseValue(index, field, parseInt(e.target.value) || 0)}
                                        className="w-full mx-2 text-center"
                                        min="0"
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => updateExerciseValue(index, field, exercise[field] + 1)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <div>
                                  <Label>Weight</Label>
                                  <div className="flex items-center ">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateExerciseValue(index, 'weight', exercise.weight - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={exercise.weight}
                                      onChange={(e) => updateExerciseValue(index, 'weight', parseInt(e.target.value) || 0)}
                                      className="w-full mx-2 text-center"
                                      min="0"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateExerciseValue(index, 'weight', exercise.weight + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="ml-2">
                                          {React.createElement(equipmentIcons[exercise.equipment], { className: "h-4 w-4" })}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        {(Object.keys(equipmentIcons) as Equipment[]).map((key) => (
                                          <DropdownMenuItem
                                            key={key}
                                            onClick={() => updateExerciseValue(index, 'equipment', key)}
                                          >
                                            {React.createElement(equipmentIcons[key], { className: "mr-2 h-4 w-4" })}
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <div>
                                  <Label>Stage</Label>
                                  <Select
                                    value={exercise.stage}
                                    onValueChange={(value) => updateExerciseValue(index, 'stage', value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select Stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Stage 1">Stage 1</SelectItem>
                                      <SelectItem value="Stage 2">Stage 2</SelectItem>
                                      <SelectItem value="Stage 3">Stage 3</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ScrollArea>
        </CardContent>
      </Card>


      <div className="flex space-x-4 justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white px-4 py-4">
              <ChevronDown className="mr-2 h-4 w-4" />
              Add Exercises
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categoryExercises.map((exercise) => (
              <DropdownMenuItem
                key={exercise.id}
                onClick={() => addExercise(exercise)}
              >
                {exercise.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex space-x-3 px-8">
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




        </div>
      </div>


      <div className="h-px bg-gray-200" />

      <div className='flex  space-x-4 justify-between'>
        <div>
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['S', 'M', 'T', 'W', 'TH', 'F', 'Sa'].map((day) => (
              <Button
                key={day}
                className={`w-10 h-10 rounded-full ${
                  selectedDays.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-900'
                }`}                onClick={() => {
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
        <div className="px-1">
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
