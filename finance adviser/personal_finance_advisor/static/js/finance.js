// Finance Utilities and Interactive Behaviors

document.addEventListener("DOMContentLoaded", function () {
    // Auto-dismiss alert banners after 5 seconds
    const alerts = document.querySelectorAll(".alert-dismissible");
    alerts.forEach((alert) => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });

    // Format numbers with INR locale commas on inputs
    const currencyInputs = document.querySelectorAll(".currency-input");
    currencyInputs.forEach((input) => {
        input.addEventListener("blur", function (e) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                e.target.dataset.raw = val;
            }
        });
    });
});
