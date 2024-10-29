

<Card>
    <CardHeader>
        <CardTitle>Excercise Programme</CardTitle>
    </CardHeader>
    <CardContent>
        <ScrollArea className="h-[400px]">
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
        </ScrollArea>

    </CardContent>
</Card>