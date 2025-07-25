const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const db = require('./db');
const { calculateLoan } = require('./utils');

const app = express();
const port = 3000;
app.use(bodyParser.json());

// POST /loans => LEND
app.post('/api/v1/loans', (req, res) => {
  const { customer_id, loan_amount, loan_period, interest_rate } = req.body;
  const { total, emi } = calculateLoan(loan_amount, loan_period, interest_rate);
  const loan_id = uuidv4();

  const stmt = db.prepare(`INSERT INTO loans VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))`);
  stmt.run(loan_id, customer_id, loan_amount, total, interest_rate, loan_period, emi);

  res.status(201).json({ loan_id, customer_id, total_amount: total, monthly_emi: emi });
});

// POST /loans/:loan_id/payments => PAYMENT
app.post('/api/v1/loans/:loan_id/payments', (req, res) => {
  const { amount, payment_type } = req.body;
  const loan_id = req.params.loan_id;

  db.get(`SELECT * FROM loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    db.all(`SELECT SUM(amount) as paid FROM payments WHERE loan_id = ?`, [loan_id], (err, rows) => {
      const amount_paid = rows[0].paid || 0;
      const new_total_paid = amount_paid + amount;
      const remaining = Math.max(loan.total_amount - new_total_paid, 0);
      const emis_left = Math.ceil(remaining / loan.monthly_emi);

      const payment_id = uuidv4();
      db.run(`INSERT INTO payments VALUES (?, ?, ?, ?, datetime('now'))`, [payment_id, loan_id, amount, payment_type]);

      if (remaining === 0) {
        db.run(`UPDATE loans SET status = 'PAID_OFF' WHERE loan_id = ?`, [loan_id]);
      }

      res.json({ payment_id, loan_id, message: 'Payment recorded', remaining_balance: remaining, emis_left });
    });
  });
});

// GET /loans/:loan_id/ledger => LEDGER
app.get('/api/v1/loans/:loan_id/ledger', (req, res) => {
  const loan_id = req.params.loan_id;

  db.get(`SELECT * FROM loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    db.all(`SELECT * FROM payments WHERE loan_id = ?`, [loan_id], (err, payments) => {
      const paid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(loan.total_amount - paid, 0);
      const emis_left = Math.ceil(remaining / loan.monthly_emi);

      res.json({
        loan_id,
        customer_id: loan.customer_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        monthly_emi: loan.monthly_emi,
        amount_paid: paid,
        balance_amount: remaining,
        emis_left,
        transactions: payments
      });
    });
  });
});

// GET /customers/:customer_id/overview => ACCOUNT OVERVIEW
app.get('/api/v1/customers/:customer_id/overview', (req, res) => {
  const customer_id = req.params.customer_id;

  db.all(`SELECT * FROM loans WHERE customer_id = ?`, [customer_id], (err, loans) => {
    if (!loans || loans.length === 0) return res.status(404).json({ error: 'No loans found' });

    const summaries = [];
    let count = 0;

    loans.forEach(loan => {
      db.all(`SELECT * FROM payments WHERE loan_id = ?`, [loan.loan_id], (err, payments) => {
        const paid = payments.reduce((sum, p) => sum + p.amount, 0);
        const emis_left = Math.ceil(Math.max(loan.total_amount - paid, 0) / loan.monthly_emi);
        const interest = loan.total_amount - loan.principal_amount;

        summaries.push({
          loan_id: loan.loan_id,
          principal: loan.principal_amount,
          total_amount: loan.total_amount,
          total_interest: interest,
          emi_amount: loan.monthly_emi,
          amount_paid: paid,
          emis_left
        });

        count++;
        if (count === loans.length) {
          res.json({ customer_id, total_loans: loans.length, loans: summaries });
        }
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Bank Lending System running at http://localhost:${port}`);
});
