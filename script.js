let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart = null;

window.onload = function() {
  initChart();
  updateUI();
  
  document.getElementById('transactionForm').onsubmit = function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    
    const transaction = {
      id: Date.now(),
      description: description,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category: category,
      type: type,
      date: new Date().toLocaleDateString()
    };
    
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    updateUI();
    this.reset();
    return false;
  };
};

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateUI();
}

function updateUI() {
  displayTransactions();
  updateBalance();
  updateChart();
}

function displayTransactions() {
  const list = document.getElementById('transactionList');
  list.innerHTML = '';
  
  if (transactions.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#999;">No transactions yet</p>';
    return;
  }
  
  transactions.forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item ' + t.type;
    li.innerHTML = `
      <div class="transaction-info">
        <h4>${t.description}</h4>
        <p>${t.category} • ${t.date}</p>
      </div>
      <span class="transaction-amount ${t.type}">
        ${t.amount > 0 ? '+' : ''}₹${Math.abs(t.amount).toFixed(2)}
      </span>
      <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function updateBalance() {
  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
  
  document.getElementById('balance').textContent = '₹' + total.toFixed(2);
  document.getElementById('income').textContent = '₹' + income.toFixed(2);
  document.getElementById('expense').textContent = '₹' + expense.toFixed(2);
}

function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  const categoryTotals = {};
  
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });
  
  chart.data.labels = Object.keys(categoryTotals);
  chart.data.datasets[0].data = Object.values(categoryTotals);
  chart.update();
}
