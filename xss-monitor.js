(function () {
  function report(data) {
    fetch("/xss-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  window.alert = function (...args) {
    report({
      type: "alert",
      args,
      location: window.location.href,
      timestamp: Date.now()
    });

    console.log("Blocked alert:", args);
  };
})();

