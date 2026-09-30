// Dashboard Charts Initialization using Chart.js

document.addEventListener("DOMContentLoaded", function () {
    if (typeof dashboardData === "undefined") return;

    // Currency Formatter Helper
    const formatINR = (value) => "₹" + Number(value).toLocaleString("en-IN");

    // 1. Income vs Expenses Bar Chart
    const ctxIncomeVsExpense = document.getElementById("incomeVsExpenseChart");
    if (ctxIncomeVsExpense) {
        new Chart(ctxIncomeVsExpense, {
            type: "bar",
            data: {
                labels: ["Income", "Expenses"],
                datasets: [{
                    data: [dashboardData.totalIncome, dashboardData.totalExpenses],
                    backgroundColor: ["#10b981", "#ef4444"],
                    borderRadius: 8,
                    maxBarThickness: 45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => formatINR(context.raw)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => "₹" + (value >= 1000 ? (value / 1000) + "k" : value)
                        },
                        grid: { color: "#f1f5f9" }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 2. Expenses by Category Doughnut Chart
    const ctxCategory = document.getElementById("categoryExpenseChart");
    if (ctxCategory) {
        const catLabels = dashboardData.categoryLabels.length > 0 ? dashboardData.categoryLabels : ["No Expenses"];
        const catData = dashboardData.categoryData.length > 0 ? dashboardData.categoryData : [1];
        const catColors = [
            "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
            "#06b6d4", "#ec4899", "#64748b", "#14b8a6", "#f97316"
        ];

        new Chart(ctxCategory, {
            type: "doughnut",
            data: {
                labels: catLabels,
                datasets: [{
                    data: catData,
                    backgroundColor: catColors.slice(0, catLabels.length),
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 10, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                if (dashboardData.categoryLabels.length === 0) return "No data";
                                return " " + context.label + ": " + formatINR(context.raw);
                            }
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    // 3. Savings vs Spending Doughnut
    const ctxSavings = document.getElementById("savingsDoughnutChart");
    if (ctxSavings) {
        const spent = dashboardData.totalExpenses;
        const saved = dashboardData.totalSavings;
        const hasData = (spent > 0 || saved > 0);

        new Chart(ctxSavings, {
            type: "doughnut",
            data: {
                labels: hasData ? ["Spending", "Savings"] : ["No Activity"],
                datasets: [{
                    data: hasData ? [spent, saved] : [1],
                    backgroundColor: hasData ? ["#ef4444", "#10b981"] : ["#e2e8f0"],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                if (!hasData) return "No activity";
                                return " " + context.label + ": " + formatINR(context.raw);
                            }
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    // 4. Budget vs Actual Spending Grouped Bar Chart
    const ctxBudget = document.getElementById("budgetVsActualChart");
    if (ctxBudget) {
        const bLabels = dashboardData.budgetLabels.length > 0 ? dashboardData.budgetLabels : ["No Budget Set"];
        const bPlanned = dashboardData.budgetPlanned.length > 0 ? dashboardData.budgetPlanned : [0];
        const bActual = dashboardData.budgetActual.length > 0 ? dashboardData.budgetActual : [0];

        new Chart(ctxBudget, {
            type: "bar",
            data: {
                labels: bLabels,
                datasets: [
                    {
                        label: "Planned",
                        data: bPlanned,
                        backgroundColor: "#93c5fd",
                        borderRadius: 4
                    },
                    {
                        label: "Actual",
                        data: bActual,
                        backgroundColor: "#2563eb",
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: (context) => " " + context.dataset.label + ": " + formatINR(context.raw)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => "₹" + (value >= 1000 ? (value / 1000) + "k" : value)
                        },
                        grid: { color: "#f1f5f9" }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }
});
