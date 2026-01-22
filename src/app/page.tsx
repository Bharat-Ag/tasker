"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ClipboardCopy, Pencil, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: number;
  text: string;
}

interface Project {
  id: number;
  name: string;
  tasks: Task[];
}

const DEFAULT_PLAN_FORMAT = `{{greeting}} sir
----------------------------
{{planTitle}}

{{projects}}
{{nextDayPlan}}`;

export default function Home() {
  // Today's plan state
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTexts, setNewTaskTexts] = useState<Record<number, string>>({});

  // Next day's plan state
  const [includeNextDayPlan, setIncludeNextDayPlan] = useState(false);
  const [nextDayProjects, setNextDayProjects] = useState<Project[]>([]);
  const [newNextDayProjectName, setNewNextDayProjectName] = useState("");
  const [newNextDayTaskTexts, setNewNextDayTaskTexts] = useState<
    Record<number, string>
  >({});

  // Time-based state
  const [greeting, setGreeting] = useState("Good Morning");
  const [planTitle, setPlanTitle] = useState("Today's Work Plan:");
  const [isEvening, setIsEvening] = useState(false);

  // Editing state
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(
    null
  );

  // Formatting state
  const [isFormatDialogOpen, setIsFormatDialogOpen] = useState(false);
  const [customFormat, setCustomFormat] = useState<string>(DEFAULT_PLAN_FORMAT);

  const { toast } = useToast();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 17) {
      setGreeting("Good Evening");
      setPlanTitle("Today's Work Done:");
      setIsEvening(true);
    } else {
      setGreeting("Good Morning");
      setPlanTitle("Today's Work Plan:");
    }
  }, []);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem("dailyPlanState");
      if (savedState) {
        const {
          projects,
          nextDayProjects,
          includeNextDayPlan,
          customFormat,
        } = JSON.parse(savedState);
        if (projects) setProjects(projects);
        if (nextDayProjects) setNextDayProjects(nextDayProjects);
        if (includeNextDayPlan) setIncludeNextDayPlan(includeNextDayPlan);
        if (customFormat) setCustomFormat(customFormat);
      }
    } catch (error) {
      console.error("Failed to load state from session storage", error);
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    try {
      const stateToSave = {
        projects,
        nextDayProjects,
        includeNextDayPlan,
        customFormat,
      };
      sessionStorage.setItem("dailyPlanState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state to session storage", error);
    }
  }, [projects, nextDayProjects, includeNextDayPlan, customFormat]);


  // Handlers for today's plan
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() === "") return;
    const newProject: Project = {
      id: Date.now(),
      name: newProjectName.trim(),
      tasks: [],
    };
    setProjects([...projects, newProject]);
    setNewProjectName("");
  };

  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleAddTask = (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    const taskText = newTaskTexts[projectId]?.trim();
    if (!taskText) return;

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        const newTask: Task = {
          id: Date.now(),
          text: taskText,
        };
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    });
    setProjects(updatedProjects);
    setNewTaskTexts({ ...newTaskTexts, [projectId]: "" });
  };

  const handleDeleteTask = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
      }
      return p;
    });
    setProjects(updatedProjects);
  };

  // Handlers for next day's plan
  const handleAddNextDayProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNextDayProjectName.trim() === "") return;
    const newProject: Project = {
      id: Date.now(),
      name: newNextDayProjectName.trim(),
      tasks: [],
    };
    setNextDayProjects([...nextDayProjects, newProject]);
    setNewNextDayProjectName("");
  };

  const handleDeleteNextDayProject = (projectId: number) => {
    setNextDayProjects(nextDayProjects.filter((p) => p.id !== projectId));
  };

  const handleAddNextDayTask = (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    const taskText = newNextDayTaskTexts[projectId]?.trim();
    if (!taskText) return;

    const updatedProjects = nextDayProjects.map((p) => {
      if (p.id === projectId) {
        const newTask: Task = {
          id: Date.now(),
          text: taskText,
        };
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    });
    setNextDayProjects(updatedProjects);
    setNewNextDayTaskTexts({ ...newNextDayTaskTexts, [projectId]: "" });
  };

  const handleDeleteNextDayTask = (projectId: number, taskId: number) => {
    const updatedProjects = nextDayProjects.map((p) => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
      }
      return p;
    });
    setNextDayProjects(updatedProjects);
  };
  
  // Edit handlers
  const handleStartEdit = (id: string, currentText: string) => {
    setEditing({ id, text: currentText });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = () => {
    if (!editing) return;

    const [type, idStr, parentIdStr] = editing.id.split("-");
    const id = Number(idStr);
    const parentId = Number(parentIdStr);

    if (editing.text.trim() === "") {
      if (type === "task") {
        handleDeleteTask(parentId, id);
      } else if (type === "nextDayTask") {
        handleDeleteNextDayTask(parentId, id);
      }
      setEditing(null);
      return;
    }

    if (type === "project") {
      const updatedProjects = projects.map((p) =>
        p.id === id ? { ...p, name: editing.text } : p
      );
      setProjects(updatedProjects);
    } else if (type === "task") {
      const updatedProjects = projects.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === id ? { ...t, text: editing.text } : t
            ),
          };
        }
        return p;
      });
      setProjects(updatedProjects);
    } else if (type === "nextDayProject") {
      const updatedProjects = nextDayProjects.map((p) =>
        p.id === id ? { ...p, name: editing.text } : p
      );
      setNextDayProjects(updatedProjects);
    } else if (type === "nextDayTask") {
      const updatedProjects = nextDayProjects.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === id ? { ...t, text: editing.text } : t
            ),
          };
        }
        return p;
      });
      setNextDayProjects(updatedProjects);
    }

    setEditing(null);
  };

  const handleEditInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const generatedPlan = useMemo(() => {
    const projectsBlock =
      projects.length === 0
        ? "No projects for today."
        : projects
            .map((project, index) => {
              let projectStr = `${index + 1}) ${project.name}\n`;
              if (project.tasks.length > 0) {
                projectStr += project.tasks
                  .map((task) => `    - ${task.text}`)
                  .join("\n");
              } else {
                projectStr += `    - No tasks for this project yet.`;
              }
              return projectStr;
            })
            .join("\n\n");

    let nextDayPlanBlock = "";
    if (includeNextDayPlan) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayName = tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const dateString = tomorrow
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const nextDayProjectsBlock =
        nextDayProjects.length === 0
          ? "No projects for the next day."
          : nextDayProjects
              .map((project, index) => {
                let projectStr = `${index + 1}) ${project.name}\n`;
                if (project.tasks.length > 0) {
                  projectStr += project.tasks
                    .map((task) => `    - ${task.text}`)
                    .join("\n");
                } else {
                  projectStr += `    - No tasks for this project yet.`;
                }
                return projectStr;
              })
              .join("\n\n");

      nextDayPlanBlock = `\n----------------------------
${dayName} Work Plan (${dateString})
----------------------------\n
${nextDayProjectsBlock}`;
    }

    return customFormat
      .replace(/{{greeting}}/g, greeting)
      .replace(/{{planTitle}}/g, planTitle)
      .replace(/{{projects}}/g, projectsBlock)
      .replace(/{{nextDayPlan}}/g, nextDayPlanBlock);
  }, [
    projects,
    greeting,
    planTitle,
    includeNextDayPlan,
    nextDayProjects,
    customFormat,
  ]);

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(generatedPlan).then(() => {
      toast({
        title: "Copied!",
        description: "The generated plan has been copied to your clipboard.",
      });
    });
  };

  return (
    <main className="min-h-screen font-body">
      <Dialog open={isFormatDialogOpen} onOpenChange={setIsFormatDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Customize Plan Format</DialogTitle>
            <DialogDescription>
              Use placeholders to customize your plan's structure.
              <br />
              Available placeholders: <code>{'{{greeting}}'}</code>,{" "}
              <code>{'{{planTitle}}'}</code>, <code>{'{{projects}}'}</code>,{" "}
              <code>{'{{nextDayPlan}}'}</code>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={customFormat}
            onChange={(e) => setCustomFormat(e.target.value)}
            rows={15}
            className="font-code"
            placeholder="Enter your custom format..."
          />
          <DialogFooter>
            <Button onClick={() => setIsFormatDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto p-4 sm:p-8 md:p-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
            Daily Plan Generator
          </h1>
          <p className="text-muted-foreground mt-4 md:text-lg">
            Organize your workday with a clear, generated plan.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Column */}
          <div className="flex flex-col gap-6">
            {isEvening && (
              <Card>
                <CardHeader>
                  <CardTitle>Plan Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNextDay"
                      checked={includeNextDayPlan}
                      onCheckedChange={(checked) =>
                        setIncludeNextDayPlan(checked as boolean)
                      }
                    />
                    <Label htmlFor="includeNextDay">
                      Include Next Day's Plan
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            <h2 className="text-2xl font-bold text-foreground/80">Today's Plan</h2>

            <Card>
              <CardHeader>
                <CardTitle>Add a New Project</CardTitle>
                <CardDescription>
                  Enter the name of your project for today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProject} className="flex gap-2">
                  <Input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project Name"
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  {editing?.id === `project-${project.id}` ? (
                    <Input
                      value={editing.text}
                      onChange={(e) =>
                        editing &&
                        setEditing({ ...editing, text: e.target.value })
                      }
                      onKeyDown={handleEditInputKeyDown}
                      onBlur={handleSaveEdit}
                      autoFocus
                      className="text-2xl font-semibold leading-none tracking-tight h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                    />
                  ) : (
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => handleStartEdit(`project-${project.id}`, project.name)}>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>
                        Add tasks for this project.
                      </CardDescription>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleStartEdit(`project-${project.id}`, project.name)
                      }
                      aria-label={`Edit project ${project.name}`}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProject(project.id)}
                      aria-label={`Delete project ${project.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {project.tasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between group"
                      >
                        {editing?.id === `task-${task.id}-${project.id}` ? (
                          <Input
                            value={editing.text}
                            onChange={(e) =>
                              editing &&
                              setEditing({ ...editing, text: e.target.value })
                            }
                            onKeyDown={handleEditInputKeyDown}
                            onBlur={handleSaveEdit}
                            autoFocus
                            className="h-7 text-sm flex-grow bg-transparent"
                          />
                        ) : (
                          <span className="text-sm flex-grow cursor-pointer" onClick={() => handleStartEdit(`task-${task.id}-${project.id}`, task.text)}>{task.text}</span>
                        )}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleStartEdit(
                                `task-${task.id}-${project.id}`,
                                task.text
                              )
                            }
                            aria-label={`Edit task ${task.text}`}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleDeleteTask(project.id, task.id)
                            }
                            aria-label={`Delete task ${task.text}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                    {project.tasks.length === 0 && (
                      <li className="text-sm text-muted-foreground italic">
                        No tasks yet.
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <form
                    onSubmit={(e) => handleAddTask(e, project.id)}
                    className="flex gap-2 w-full"
                  >
                    <Input
                      type="text"
                      value={newTaskTexts[project.id] || ""}
                      onChange={(e) =>
                        setNewTaskTexts({
                          ...newTaskTexts,
                          [project.id]: e.target.value,
                        })
                      }
                      placeholder="New Task"
                    />
                    <Button type="submit" variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}

            {includeNextDayPlan && (
              <>
                <h2 className="text-2xl font-bold text-foreground/80 mt-4">
                  Next Day's Plan
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Add a New Project for Next Day</CardTitle>
                    <CardDescription>
                      Enter the name of your project for the next day.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleAddNextDayProject}
                      className="flex gap-2"
                    >
                      <Input
                        type="text"
                        value={newNextDayProjectName}
                        onChange={(e) =>
                          setNewNextDayProjectName(e.target.value)
                        }
                        placeholder="Project Name"
                      />
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {nextDayProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      {editing?.id === `nextDayProject-${project.id}` ? (
                        <Input
                          value={editing.text}
                          onChange={(e) =>
                            editing &&
                            setEditing({ ...editing, text: e.target.value })
                          }
                          onKeyDown={handleEditInputKeyDown}
                          onBlur={handleSaveEdit}
                          autoFocus
                          className="text-2xl font-semibold leading-none tracking-tight h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                        />
                      ) : (
                        <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => handleStartEdit(`nextDayProject-${project.id}`, project.name)}>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>
                            Add tasks for this project.
                          </CardDescription>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleStartEdit(
                              `nextDayProject-${project.id}`,
                              project.name
                            )
                          }
                          aria-label={`Edit project ${project.name}`}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteNextDayProject(project.id)
                          }
                          aria-label={`Delete project ${project.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {project.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center justify-between group"
                          >
                             {editing?.id === `nextDayTask-${task.id}-${project.id}` ? (
                              <Input
                                value={editing.text}
                                onChange={(e) =>
                                  editing &&
                                  setEditing({ ...editing, text: e.target.value })
                                }
                                onKeyDown={handleEditInputKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="h-7 text-sm flex-grow bg-transparent"
                              />
                            ) : (
                              <span className="text-sm flex-grow cursor-pointer" onClick={() => handleStartEdit(`nextDayTask-${task.id}-${project.id}`, task.text)}>{task.text}</span>
                            )}
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleStartEdit(
                                    `nextDayTask-${task.id}-${project.id}`,
                                    task.text
                                  )
                                }
                                aria-label={`Edit task ${task.text}`}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleDeleteNextDayTask(project.id, task.id)
                                }
                                aria-label={`Delete task ${task.text}`}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </li>
                        ))}
                        {project.tasks.length === 0 && (
                          <li className="text-sm text-muted-foreground italic">
                            No tasks yet.
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <form
                        onSubmit={(e) => handleAddNextDayTask(e, project.id)}
                        className="flex gap-2 w-full"
                      >
                        <Input
                          type="text"
                          value={newNextDayTaskTexts[project.id] || ""}
                          onChange={(e) =>
                            setNewNextDayTaskTexts({
                              ...newNextDayTaskTexts,
                              [project.id]: e.target.value,
                            })
                          }
                          placeholder="New Task"
                        />
                        <Button type="submit" variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Output Column */}
          <div className="lg:sticky lg:top-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Generated Plan</CardTitle>
                  <CardDescription>
                    Your formatted work plan.
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFormatDialogOpen(true)}
                    aria-label="Customize plan format"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyPlan}
                    aria-label="Copy plan"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-code text-sm text-muted-foreground">
                  {generatedPlan}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
