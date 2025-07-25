function calculateLoan(P, N, R) {
  const I = P * N * (R / 100);
  const A = P + I;
  const emi = A / (N * 12);
  return { total: A, emi, interest: I };
}

module.exports = { calculateLoan };
