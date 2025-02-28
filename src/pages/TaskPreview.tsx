
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import { ChevronLeft, Printer, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  details: string;
  date: string;
  priority: string;
}

const TaskPreview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Fix: The content property needs to be provided during function call, not as an option
  const handlePrint = useReactToPrint({
    documentTitle: "Task List",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["task-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        details: task.description || "",
        date: task.due_date,
        priority: task.priority.toLowerCase(),
      }));
    },
  });

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="container mx-auto px-4 py-6 pb-20"
    >
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Task List</h1>
        </div>
        <div className="flex gap-2">
          {/* Fix: Pass the printRef when the function is called */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handlePrint(undefined, () => printRef.current)}
          >
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div ref={printRef} className="space-y-4 mt-6">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No tasks found. Try a different search term.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{task.title}</h3>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{task.details}</p>
              <div className="text-xs text-muted-foreground">
                Due: {new Date(task.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TaskPreview;
