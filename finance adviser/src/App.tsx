import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  PieChart,
  TrendingUp,
  CreditCard,
  Target,
  FileText,
  Bot,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Download,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  Send,
  Zap,
  RefreshCw,
  LogOut,
  UserCheck,
} from "lucide-react";

// Types
export interface Transaction {
  id: string;
  type: "income" | "expense";
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod?: string;
}

export interface CategoryLimit {
  id: string;
  name: string;
  monthlyLimit: number;
}

export interface BudgetPlan {
  id: string;
  category: string;
  month: number;
  year: number;
  plannedAmount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
}

export interface PythonFileItem {
  path: string;
  name: string;
  content: string;
}

const DEFAULT_CATEGORIES: CategoryLimit[] = [
  { id: "c1", name: "Rent", monthlyLimit: 22000 },
  { id: "c2", name: "Food", monthlyLimit: 10000 },
  { id: "c3", name: "Transport", monthlyLimit: 4000 },
  { id: "c4", name: "Utilities", monthlyLimit: 3500 },
  { id: "c5", name: "Entertainment", monthlyLimit: 3000 },
  { id: "c6", name: "Shopping", monthlyLimit: 4500 },
  { id: "c7", name: "Healthcare", monthlyLimit: 2500 },
  { id: "c8", name: "Bills", monthlyLimit: 2500 },
  { id: "c9", name: "Other", monthlyLimit: 2000 },
];

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-inc-1",
    type: "income",
    title: "Primary Salary (Tech Corp)",
    category: "Salary",
    amount: 72000,
    date: "2025-05-01",
    description: "Monthly salary credit after tax",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "tx-inc-2",
    type: "income",
    title: "Freelance UI Consulting",
    category: "Freelance",
    amount: 14000,
    date: "2025-05-10",
    description: "Web client payment milestone",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "tx-exp-1",
    type: "expense",
    title: "2BHK Apartment Rent",
    category: "Rent",
    amount: 22000,
    date: "2025-05-02",
    description: "Monthly apartment lease",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "tx-exp-2",
    type: "expense",
    title: "DMart Monthly Bulk Groceries",
    category: "Food",
    amount: 5400,
    date: "2025-05-05",
    description: "Flour, pulses, oil, spices, dairy",
    paymentMethod: "UPI",
  },
  {
    id: "tx-exp-3",
    type: "expense",
    title: "Weekend Family Dinner",
    category: "Food",
    amount: 2150,
    date: "2025-05-09",
    description: "Restaurant dining with relatives",
    paymentMethod: "Credit Card",
  },
  {
    id: "tx-exp-4",
    type: "expense",
    title: "High-speed Fiber & Electricity",
    category: "Utilities",
    amount: 2600,
    date: "2025-05-06",
    description: "Airtel fiber 300Mbps + BESCOM bill",
    paymentMethod: "UPI",
  },
  {
    id: "tx-exp-5",
    type: "expense",
    title: "Metro Smart Card & Fuel",
    category: "Transport",
    amount: 3200,
    date: "2025-05-07",
    description: "Commute recharge and vehicle fuel",
    paymentMethod: "Debit Card",
  },
  {
    id: "tx-exp-6",
    type: "expense",
    title: "Summer Formal Wear",
    category: "Shopping",
    amount: 3800,
    date: "2025-05-12",
    description: "Shirts and footwear",
    paymentMethod: "Credit Card",
  },
  {
    id: "tx-exp-7",
    type: "expense",
    title: "Cinema & OTT Subscriptions",
    category: "Entertainment",
    amount: 1499,
    date: "2025-05-14",
    description: "Netflix + weekend cinema tickets",
    paymentMethod: "UPI",
  },
  {
    id: "tx-exp-8",
    type: "expense",
    title: "Routine Medical & Vitamins",
    category: "Healthcare",
    amount: 1200,
    date: "2025-05-11",
    description: "Pharmacy bill",
    paymentMethod: "UPI",
  },
];

const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "sg-1",
    name: "Emergency Reserve Fund",
    targetAmount: 150000,
    currentAmount: 85000,
    targetDate: "2025-12-31",
    description: "6 months essential living expenses in liquid fund",
  },
  {
    id: "sg-2",
    name: "MacBook Pro Upgrade",
    targetAmount: 120000,
    currentAmount: 65000,
    targetDate: "2025-09-30",
    description: "Professional workstation upgrade",
  },
  {
    id: "sg-3",
    name: "Goa Beach Vacation",
    targetAmount: 40000,
    currentAmount: 28000,
    targetDate: "2025-11-15",
    description: "Flights and hotel for annual family trip",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "incomes" | "expenses" | "categories" | "budgets" | "savings" | "reports" | "aiAdvisor" | "sourceCode"
  >("dashboard");

  const [selectedMonth, setSelectedMonth] = useState<number>(5);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("pfa_transactions");
    return saved ? JSON.parse(saved) : INITIAL_DEMO_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryLimit[]>(() => {
    const saved = localStorage.getItem("pfa_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<BudgetPlan[]>(() => {
    const saved = localStorage.getItem("pfa_budgets");
    if (saved) return JSON.parse(saved);
    return DEFAULT_CATEGORIES.map((c, i) => ({
      id: `b-${i}`,
      category: c.name,
      month: 5,
      year: 2025,
      plannedAmount: c.monthlyLimit,
    }));
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem("pfa_savings");
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem("pfa_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("pfa_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("pfa_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("pfa_savings", JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Financial Computations
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const totalExpenses = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const remainingBalance = totalIncome - totalExpenses;
  const totalSavingsRecorded = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const effectiveSavingsThisMonth = Math.max(0, remainingBalance);
  const savingsRate = totalIncome > 0 ? Math.round((effectiveSavingsThisMonth / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  // Category-wise spending
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return categories.map((cat) => {
      const spent = map[cat.name] || 0;
      const limit = cat.monthlyLimit || 0;
      const budget = budgets.find(
        (b) => b.category === cat.name && b.month === selectedMonth && b.year === selectedYear
      );
      const planned = budget ? budget.plannedAmount : limit;
      const percentUsed = planned > 0 ? Math.round((spent / planned) * 100) : spent > 0 ? 100 : 0;
      return {
        name: cat.name,
        spent,
        limit,
        planned,
        percentUsed,
        remaining: Math.max(0, planned - spent),
        isOver: planned > 0 && spent > planned,
      };
    });
  }, [monthlyTransactions, categories, budgets, selectedMonth, selectedYear]);

  // Financial Health Indicator
  const financialHealth = useMemo(() => {
    if (totalIncome === 0 && totalExpenses === 0) {
      return {
        status: "Needs Data",
        color: "bg-amber-100 text-amber-800 border-amber-300",
        message: "Add income and expenses for this month to generate an educational health assessment.",
      };
    }
    if (expenseRatio > 90) {
      return {
        status: "High Spending",
        color: "bg-rose-100 text-rose-800 border-rose-300",
        message: `Expenses consume ${expenseRatio}% of income. Aim to rein in discretionary shopping or dining.`,
      };
    }
    if (savingsRate >= 20) {
      return {
        status: "Good",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        message: `Healthy savings rate of ${savingsRate}% exceeds the standard 20% benchmark.`,
      };
    }
    return {
      status: "Moderate",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      message: `Savings rate of ${savingsRate}% is positive. Trimming non-essential categories can accelerate goal targets.`,
    };
  }, [totalIncome, totalExpenses, savingsRate, expenseRatio]);

  // Format INR Helper
  const formatINR = (val: number) => "₹" + Number(val).toLocaleString("en-IN");

  // Reset to Demo Data
  const handleResetDemo = () => {
    setTransactions(INITIAL_DEMO_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBudgets(
      DEFAULT_CATEGORIES.map((c, i) => ({
        id: `b-${i}`,
        category: c.name,
        month: 5,
        year: 2025,
        plannedAmount: c.monthlyLimit,
      }))
    );
  };

  // State for AI Chat
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "bot"; text: string; time: string }[]
  >([
    {
      sender: "bot",
      text: "Hello! I am your AI Personal Finance Advisor Bot. I have analyzed your income (₹86,000), expenses (₹41,849), and 3 active savings goals. How can I assist your personal financial growth today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Send AI Chat Message
  const handleSendChat = async (promptText?: string) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          financialData: {
            totalIncome,
            totalExpenses,
            remainingBalance,
            savingsRate,
            categorySpending: categorySpending.map((c) => ({
              category: c.name,
              spent: c.spent,
              planned: c.planned,
            })),
            savingsGoals: savingsGoals.map((g) => ({
              name: g.name,
              target: g.targetAmount,
              saved: g.currentAmount,
            })),
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer || "I processed your request.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Could not connect to AI service. Ensure you have an active network connection or configure GEMINI_API_KEY.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // State for AI Smart Budget Generation
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [smartBudgetModal, setSmartBudgetModal] = useState<any>(null);

  const handleGenerateSmartBudget = async () => {
    setIsGeneratingBudget(true);
    try {
      const res = await fetch("/api/ai/generate-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: totalIncome || 80000,
          financialGoal: "Save 20% and build 6-month emergency reserve",
          categories: categories.map((c) => c.name),
          recentExpenses: monthlyTransactions
            .filter((t) => t.type === "expense")
            .map((t) => ({ category: t.category, amount: t.amount })),
        }),
      });
      const data = await res.json();
      setSmartBudgetModal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  const handleApplySmartBudget = () => {
    if (!smartBudgetModal || !smartBudgetModal.budget) return;
    const newBudgets = smartBudgetModal.budget.map((item: any, idx: number) => ({
      id: `smart-b-${idx}-${Date.now()}`,
      category: item.category,
      month: selectedMonth,
      year: selectedYear,
      plannedAmount: Number(item.amount) || 0,
    }));
    setBudgets(newBudgets);
    setSmartBudgetModal(null);
    setActiveTab("budgets");
  };

  // State for New Transaction Modal
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<"income" | "expense">("expense");
  const [newTxTitle, setNewTxTitle] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxCategory, setNewTxCategory] = useState("Food");
  const [newTxDate, setNewTxDate] = useState("2025-05-15");
  const [newTxPayment, setNewTxPayment] = useState("UPI");
  const [newTxDesc, setNewTxDesc] = useState("");

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newTxAmount);
    if (!amt || amt <= 0 || !newTxTitle.trim()) return;

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      type: newTxType,
      title: newTxTitle.trim(),
      category: newTxCategory,
      amount: amt,
      date: newTxDate,
      paymentMethod: newTxPayment,
      description: newTxDesc.trim(),
    };
    setTransactions([newTx, ...transactions]);
    setIsAddTxModalOpen(false);
    setNewTxTitle("");
    setNewTxAmount("");
    setNewTxDesc("");
  };

  // State for New Savings Goal Modal
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalSaved, setNewGoalSaved] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("2025-12-31");
  const [newGoalDesc, setNewGoalDesc] = useState("");

  const handleSaveSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    if (!target || target <= 0 || !newGoalName.trim()) return;

    const newGoal: SavingsGoal = {
      id: "goal-" + Date.now(),
      name: newGoalName.trim(),
      targetAmount: target,
      currentAmount: parseFloat(newGoalSaved) || 0,
      targetDate: newGoalDate,
      description: newGoalDesc.trim(),
    };
    setSavingsGoals([...savingsGoals, newGoal]);
    setIsAddGoalModalOpen(false);
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalSaved("");
    setNewGoalDesc("");
  };

  // Python Flask Source Files Explorer State
  const [pythonFiles, setPythonFiles] = useState<PythonFileItem[]>([]);
  const [selectedPythonFile, setSelectedPythonFile] = useState<PythonFileItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetch("/api/python-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setPythonFiles(data.files);
          setSelectedPythonFile(data.files.find((f: any) => f.name === "app.py") || data.files[0]);
        }
      })
      .catch((err) => console.log("Files API notice:", err));
  }, []);

  const handleCopyCode = () => {
    if (!selectedPythonFile) return;
    navigator.clipboard.writeText(selectedPythonFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!selectedPythonFile) return;
    const blob = new Blob([selectedPythonFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedPythonFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">FinAdvisor</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Bot
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5">Personal Finance Platform (₹ INR)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("incomes")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "incomes" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "expenses" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "categories" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("budgets")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "budgets" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Budgets
            </button>
            <button
              onClick={() => setActiveTab("savings")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "savings" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "reports" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab("aiAdvisor")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "aiAdvisor"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-amber-400 hover:text-amber-300 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Advisor
            </button>
            <button
              onClick={() => setActiveTab("sourceCode")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "sourceCode"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Python Source
            </button>
          </nav>

          {/* Quick Actions & Demo Account */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
              title="Reset Demo Data (Tech Salary & Indian Rupee Expenses)"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={() => {
                setNewTxType("expense");
                setIsAddTxModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex overflow-x-auto border-t border-slate-800 px-4 py-2 gap-2 text-xs">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "incomes", label: "Income" },
            { id: "expenses", label: "Expenses" },
            { id: "categories", label: "Categories" },
            { id: "budgets", label: "Budgets" },
            { id: "savings", label: "Savings" },
            { id: "reports", label: "Reports" },
            { id: "aiAdvisor", label: "AI Advisor" },
            { id: "sourceCode", label: "Flask Code" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                activeTab === item.id ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Header + Month Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Finance Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Comprehensive cash flow, category distributions, and AI insights in Indian Rupees (₹)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500 ml-1" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateSmartBudget}
                  disabled={isGeneratingBudget}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingBudget ? "Analyzing..." : "Smart Budget"}</span>
                </button>
              </div>
            </div>

            {/* Financial Health Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${financialHealth.color}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/80 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider">Financial Health:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 shadow-2xs">
                      {financialHealth.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">{financialHealth.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="bg-white/80 px-2.5 py-1 rounded-lg">Savings Rate: {savingsRate}%</span>
                <span className="bg-white/80 px-2.5 py-1 rounded-lg">Expense Ratio: {expenseRatio}%</span>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Income */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mb-1">{formatINR(totalIncome)}</div>
                <div className="text-xs text-slate-500">Credited across {monthlyTransactions.filter((t) => t.type === "income").length} sources</div>
              </div>

              {/* Card 2: Total Expenses */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-600 mb-1">{formatINR(totalExpenses)}</div>
                <div className="text-xs text-slate-500">{expenseRatio}% of total monthly income</div>
              </div>

              {/* Card 3: Total Savings */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Surplus</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-blue-600 mb-1">{formatINR(effectiveSavingsThisMonth)}</div>
                <div className="text-xs text-slate-500">Savings rate: {savingsRate}% of inflow</div>
              </div>

              {/* Card 4: Remaining Balance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Balance</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold mb-1 ${remainingBalance >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                  {formatINR(remainingBalance)}
                </div>
                <div className="text-xs text-slate-500">Income minus total expenses</div>
              </div>
            </div>

            {/* Visual Charts & Category Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Spending Bars */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Category Spending & Limits</h3>
                    <p className="text-xs text-slate-500">Monthly actual expenditures compared against planned allocations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("categories")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Manage Caps &rarr;
                  </button>
                </div>

                <div className="space-y-3.5">
                  {categorySpending.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700 font-semibold">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">{formatINR(cat.spent)}</span>
                          <span className="text-slate-400">/ {formatINR(cat.planned)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cat.isOver ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                            {cat.percentUsed}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cat.isOver ? "bg-rose-500" : cat.percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Flow Distribution & AI Quick Prompt */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-slate-800 mb-2">50/30/20 Rule Analysis</h3>
                  <p className="text-xs text-slate-500 mb-4">Recommended benchmark for balanced personal finances</p>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Needs (Essentials 50%)</span>
                        <span className="text-slate-900">{formatINR(totalIncome * 0.5)}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Rent, Groceries, Utilities, Transit</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Wants (Discretionary 30%)</span>
                        <span className="text-slate-900">{formatINR(totalIncome * 0.3)}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Dining out, Entertainment, Shopping</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Savings & Debt (20%)</span>
                        <span className="text-emerald-700 font-bold">{formatINR(totalIncome * 0.2)}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Emergency reserves, investments, goals</span>
                    </div>
                  </div>
                </div>

                {/* AI Advice Card */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Ask AI Advisor</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Analyze food, grocery, or rent trends and receive tailored recommendations in Indian Rupees.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("aiAdvisor");
                      handleSendChat("Where am I spending too much money this month?");
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    Analyze My Spending with Gemini
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                  <p className="text-xs text-slate-500">Latest recorded income and expenses</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewTxType("income");
                      setIsAddTxModalOpen(true);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  >
                    + Income
                  </button>
                  <button
                    onClick={() => {
                      setNewTxType("expense");
                      setIsAddTxModalOpen(true);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  >
                    + Expense
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Title / Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyTransactions.slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 text-xs text-slate-500">{tx.date}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{tx.title}</div>
                          <div className="text-xs text-slate-400">{tx.description}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">{tx.paymentMethod || "UPI"}</td>
                        <td className={`py-3 px-3 text-right font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                          {tx.type === "income" ? "+" : "-"}{formatINR(tx.amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setTransactions(transactions.filter((t) => t.id !== tx.id))}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= INCOMES TAB ================= */}
        {activeTab === "incomes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Income Inflow Log</h2>
                <p className="text-xs text-slate-500">Track salary deposits, consulting milestones, and scholarships</p>
              </div>
              <button
                onClick={() => {
                  setNewTxType("income");
                  setIsAddTxModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Income Entry
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Source / Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions
                    .filter((t) => t.type === "income")
                    .map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-xs text-slate-500">{inc.date}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{inc.title}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            {inc.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">{inc.description || "-"}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-600">
                          {formatINR(inc.amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setTransactions(transactions.filter((t) => t.id !== inc.id))}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= EXPENSES TAB ================= */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Expenses Register</h2>
                <p className="text-xs text-slate-500">Record payments with UPI, Credit Cards, or Cash</p>
              </div>
              <button
                onClick={() => {
                  setNewTxType("expense");
                  setIsAddTxModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Record New Expense
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Expense Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions
                    .filter((t) => t.type === "expense")
                    .map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-xs text-slate-500">{exp.date}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{exp.title}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">{exp.paymentMethod || "UPI"}</td>
                        <td className="py-3 px-3 text-xs text-slate-400">{exp.description || "-"}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-rose-600">
                          -{formatINR(exp.amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setTransactions(transactions.filter((t) => t.id !== exp.id))}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Expense Categories & Caps</h2>
                <p className="text-xs text-slate-500">Configure monthly spending limits per bucket</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const spent = categorySpending.find((item) => item.name === c.name)?.spent || 0;
                const pct = c.monthlyLimit > 0 ? Math.round((spent / c.monthlyLimit) * 100) : 0;
                return (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800">{c.name}</h3>
                      <span className="text-xs font-semibold text-slate-400">Limit: {formatINR(c.monthlyLimit)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Current Spent: {formatINR(spent)}</span>
                        <span>{pct}% Used</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct > 100 ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-blue-600"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= BUDGETS TAB ================= */}
        {activeTab === "budgets" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Monthly Budget Plan</h2>
                <p className="text-xs text-slate-500">Planned allocations vs. actual expenditures for May 2025</p>
              </div>
              <button
                onClick={handleGenerateSmartBudget}
                disabled={isGeneratingBudget}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingBudget ? "Generating..." : "Generate AI Smart Budget"}</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Planned Budget</th>
                    <th className="py-2.5 px-3">Actual Spent</th>
                    <th className="py-2.5 px-3">Remaining</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categorySpending.map((cat) => (
                    <tr key={cat.name} className={cat.isOver ? "bg-rose-50/40" : "hover:bg-slate-50"}>
                      <td className="py-3 px-3 font-semibold text-slate-800">{cat.name}</td>
                      <td className="py-3 px-3 text-slate-700">{formatINR(cat.planned)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatINR(cat.spent)}</td>
                      <td className="py-3 px-3 text-slate-500">{formatINR(cat.remaining)}</td>
                      <td className="py-3 px-3" style={{ minWidth: "160px" }}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${cat.isOver ? "bg-rose-500" : cat.percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 w-10 text-right">{cat.percentUsed}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {cat.isOver ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            Over Budget
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SAVINGS TAB ================= */}
        {activeTab === "savings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Savings & Wealth Goals</h2>
                <p className="text-xs text-slate-500">Track milestones for emergency reserves, tech gear, and vacations</p>
              </div>
              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Goal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savingsGoals.map((g) => {
                const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
                return (
                  <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                          Goal Milestone
                        </span>
                        <button
                          onClick={() => setSavingsGoals(savingsGoals.filter((item) => item.id !== g.id))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{g.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{g.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xl font-extrabold text-emerald-600">{formatINR(g.currentAmount)}</span>
                        <span className="text-xs text-slate-400">of {formatINR(g.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{pct}% Achieved</span>
                        <span>Target: {g.targetDate}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => {
                          const deposit = 5000;
                          setSavingsGoals(
                            savingsGoals.map((item) =>
                              item.id === g.id ? { ...item, currentAmount: item.currentAmount + deposit } : item
                            )
                          );
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition"
                      >
                        + Contribute ₹5,000
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= REPORTS TAB ================= */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Monthly Financial Statement</h2>
                <p className="text-xs text-slate-500">Audit-ready monthly statement formatted for printing and PDF generation</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
              <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Personal Finance Advisor Bot</h1>
                  <p className="text-xs text-slate-500">Official Monthly Financial Performance Audit</p>
                  <p className="text-xs text-slate-400 mt-1">Period: May 2025 | Currency: Indian Rupee (₹)</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    Health: {financialHealth.status}
                  </span>
                  <div className="text-xs text-slate-400 mt-2">Generated: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* 4 Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Inflow</span>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{formatINR(totalIncome)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Outflow</span>
                  <div className="text-lg font-bold text-rose-600 mt-1">{formatINR(totalExpenses)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Net Savings</span>
                  <div className="text-lg font-bold text-blue-600 mt-1">{formatINR(effectiveSavingsThisMonth)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Savings Rate</span>
                  <div className="text-lg font-bold text-indigo-600 mt-1">{savingsRate}%</div>
                </div>
              </div>

              {/* Category Table */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">Category-Wise Breakdown</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Actual Spent</th>
                        <th className="py-2.5 px-3">Planned Limit</th>
                        <th className="py-2.5 px-3">Variance</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categorySpending.map((cat) => (
                        <tr key={cat.name}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{cat.name}</td>
                          <td className="py-2.5 px-3">{formatINR(cat.spent)}</td>
                          <td className="py-2.5 px-3">{formatINR(cat.planned)}</td>
                          <td className="py-2.5 px-3">{formatINR(cat.remaining)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.isOver ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {cat.isOver ? "Exceeded" : "Within Limit"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observations & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2">Financial Observations</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>Maintained positive cash surplus for May 2025.</li>
                    <li>Rent constitutes the single largest monthly commitment at {Math.round((22000 / (totalExpenses || 1)) * 100)}% of outflow.</li>
                    <li>3 savings goals are in positive trajectory.</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-amber-950 mb-2">AI Guidance</h4>
                  <ul className="space-y-1.5 text-amber-900 list-disc list-inside">
                    <li>Consolidate discretionary dining into weekly planned meals to save ~₹1,500/month.</li>
                    <li>Route ₹5,000 from current surplus directly to Emergency Reserve milestone.</li>
                    <li>Continue automating savings on the 1st of every month before discretionary spending.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= AI ADVISOR TAB ================= */}
        {activeTab === "aiAdvisor" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">AI Personal Finance Advisor</h2>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                    Google Gemini 3.8
                  </span>
                </div>
                <p className="text-xs text-slate-500">Ask questions grounded in your live financial data and spending history</p>
              </div>

              <button
                onClick={() => handleSendChat("Please provide a deep analysis of my spending habits and recommend 3 ways to save more.")}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Analyze Spending Habits
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Container */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px]">
                {/* Messages scroll */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.sender === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.sender === "user" ? "bg-blue-600 text-white rounded-tr-xs" : "bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-line"
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-blue-200" : "text-slate-400"}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-3 items-center text-xs text-slate-400">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Advisor is reviewing your financial records...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested prompt pills */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex flex-wrap gap-2 text-xs">
                  {[
                    "How can I reduce my food expenses?",
                    "Where am I spending too much?",
                    "How much should I save this month?",
                    "How can I build an emergency fund?",
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChat(pill)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-800 text-[11px] transition"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Ask a question about your personal finances..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Grounded Context */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Grounded Profile Context</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Monthly Inflow:</span>
                      <span className="font-bold text-emerald-600">{formatINR(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Monthly Outflow:</span>
                      <span className="font-bold text-rose-600">{formatINR(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Current Surplus:</span>
                      <span className="font-bold text-blue-600">{formatINR(effectiveSavingsThisMonth)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Savings Rate:</span>
                      <span className="font-bold text-slate-800">{savingsRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Educational Disclaimer</span>
                  <p className="opacity-90 leading-relaxed">
                    This assistant provides educational guidance based on math models and the 50/30/20 guideline. It does not provide certified financial advisory or guarantee investment returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PYTHON SOURCE CODE EXPLORER TAB ================= */}
        {activeTab === "sourceCode" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Python / Flask Source Explorer</h2>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    Standalone Backend
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Inspect the complete Flask, SQLAlchemy, Jinja2, and service layer files generated for local Windows/Linux execution
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Code Explorer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-slate-300 shadow-xl">
              {/* File Tree Sidebar */}
              <div className="p-4 border-r border-slate-800 space-y-1 lg:h-[620px] overflow-y-auto">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1 mb-2">
                  Generated Files
                </div>
                {pythonFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedPythonFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      selectedPythonFile?.path === file.path
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="lg:col-span-3 flex flex-col lg:h-[620px]">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {selectedPythonFile?.path || "app.py"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedPythonFile?.content.split("\n").length || 0} lines
                  </span>
                </div>

                <pre className="p-5 flex-1 overflow-auto text-xs font-mono text-slate-200 leading-relaxed bg-slate-950/90 selection:bg-blue-600/40">
                  <code>{selectedPythonFile?.content || "# Select a file to inspect"}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Record Transaction (Income or Expense) */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Record {newTxType === "income" ? "Income Inflow" : "Expense Outflow"}
              </h3>
              <button onClick={() => setIsAddTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewTxType("income")}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                    newTxType === "income"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType("expense")}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                    newTxType === "expense"
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Expense
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title / Vendor</label>
                <input
                  type="text"
                  required
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  placeholder={newTxType === "income" ? "e.g. Salary, Consulting" : "e.g. DMart Groceries, Swiggy"}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {newTxType === "income" ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newTxDate}
                    onChange={(e) => setNewTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={newTxPayment}
                    onChange={(e) => setNewTxPayment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  placeholder="Notes or details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Savings Goal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Savings Goal</h3>
              <button onClick={() => setIsAddGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSavingsGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Laptop, Goa Trip"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newGoalSaved}
                    onChange={(e) => setNewGoalSaved(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="e.g. Liquid mutual fund or FD reserve"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Smart Budget Review */}
      {smartBudgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">AI 50/30/20 Smart Budget</h3>
                <p className="text-xs text-slate-500">Review AI suggested allocations before applying to your account</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
              {smartBudgetModal.summary}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Suggested Savings Target</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {formatINR(smartBudgetModal.savings_target || 12000)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Emergency Reserve Portion</span>
                <span className="text-base font-extrabold text-blue-600">
                  {formatINR(smartBudgetModal.emergency_fund || 4000)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Category Allocations:</span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {smartBudgetModal.budget?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <span className="text-slate-400 block text-[11px]">{item.reason}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSmartBudgetModal(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Discard
              </button>
              <button
                onClick={handleApplySmartBudget}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
              >
                Apply Smart Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
