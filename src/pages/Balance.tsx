import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, transactionStorage } from '../lib/storage';
import { Wallet, Plus, TrendingDown, CheckCircle2, Copy } from 'lucide-react';
import Header from '../components/Header';
import { Student, Transaction } from '../lib/supabase';

export default function Balance() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeForm, setShowRechargeForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        setStudent(studentData);
        setTransactions(transactionStorage.getTransactions());
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const presetAmounts = [1000, 2500, 5000, 10000];

  const generateTransactionId = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TXN-${dateStr}-${random}`;
  };

  const handleRecharge = async (amount: number) => {
    if (!student) return;
    
    setProcessing(true);
    setTimeout(() => {
      const newBalance = (student.current_balance || 0) + amount;
      const updatedStudent = { ...student, current_balance: newBalance };
      setStudent(updatedStudent);

      const transactionId = generateTransactionId();
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        student_id: student.id,
        amount: amount,
        type: 'recharge' as const,
        description: 'Wallet recharge via bKash',
        balance_after: newBalance,
        transaction_id: transactionId,
        created_at: new Date().toISOString(),
      };

      studentStorage.updateStudent({ current_balance: newBalance });
      transactionStorage.addTransaction(newTransaction);
      setTransactions([newTransaction, ...transactions]);
      setRechargeAmount('');
      setProcessing(false);
      setRechargeSuccess(true);
      setTimeout(() => setRechargeSuccess(false), 3000);
    }, 1500);
  };

  const copyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
  };

  const totalSpent = transactions
    .filter(t => t.type === 'deduction')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRecharged = transactions
    .filter(t => t.type === 'recharge')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-slate-600">Loading balance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C83FD]/100 via-white to-[#7C83FD]/100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                <p className="text-5xl font-bold">৳{(student?.current_balance || 0).toLocaleString()}</p>
              </div>
              <Wallet className="text-blue-200" size={40} />
            </div>
            <button
              onClick={() => setShowRechargeForm(!showRechargeForm)}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Recharge Now
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm mb-2">Total Recharged</p>
            <p className="text-3xl font-bold text-slate-900">৳{totalRecharged.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2">across all transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <p className="text-slate-600 text-sm mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-slate-900">৳{totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2">on application fees</p>
          </div>
        </div>

        {showRechargeForm && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recharge Your Wallet</h2>

            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-4">Quick Top-up</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleRecharge(amount)}
                    disabled={processing}
                    className="border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 text-slate-900 font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    ৳{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-4">Custom Amount</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>
                <button
                  onClick={() => handleRecharge(parseInt(rechargeAmount) || 0)}
                  disabled={!rechargeAmount || processing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold px-8 py-3 rounded-lg transition"
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Payment Methods Supported:</p>
              <ul className="space-y-1">
                <li>✓ Credit/Debit Cards</li>
                <li>✓ Mobile Banking (bKash, Nagad, Rocket)</li>
                <li>✓ Bank Transfer</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRechargeForm(false)}
              className="mt-6 text-slate-600 hover:text-slate-900 font-medium transition"
            >
              ✕ Close
            </button>
          </div>
        )}

        {rechargeSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <p className="font-semibold text-green-900">Recharge Successful!</p>
              <p className="text-sm text-green-800">Your wallet has been credited</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Transaction ID</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-900">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.type === 'recharge' ? (
                          <>
                            <Plus className="text-green-600" size={16} />
                            <span className="text-green-600 font-semibold">Recharge</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="text-red-600" size={16} />
                            <span className="text-red-600 font-semibold">Deduction</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{tx.description}</td>
                    <td className="px-4 py-3">
                      {tx.transaction_id ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-300 text-slate-700">
                            {tx.transaction_id}
                          </code>
                          <button
                            onClick={() => copyTransactionId(tx.transaction_id)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Copy Transaction ID"
                          >
                            <Copy className="text-slate-600" size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      tx.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'recharge' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                      ৳{tx.balance_after.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
