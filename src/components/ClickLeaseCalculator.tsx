import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, Tag, DollarSign, TrendingUp, ClipboardCheck, Rocket, Save, RotateCcw, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CalculatorState {
  purchasePrice: number;
  downPayment: number;
  creditScore: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CalculationResults {
  financedAmount: number;
  monthlyPayment: number;
  maxApproval: number;
  apr: number;
  downPaymentPercent: number;
}

export function ClickLeaseCalculator() {
  const { toast } = useToast();
  const [state, setState] = useState<CalculatorState>({
    purchasePrice: 50000,
    downPayment: 5000,
    creditScore: 'excellent'
  });

  const [results, setResults] = useState<CalculationResults>({
    financedAmount: 0,
    monthlyPayment: 0,
    maxApproval: 0,
    apr: 0,
    downPaymentPercent: 0
  });

  const saveQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await fetch('/api/finance-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });
      if (!response.ok) {
        throw new Error('Failed to save quote');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Saved Successfully!",
        description: "Your financing quote has been saved to your account.",
      });
      if ((window as any).playSoundEffect) {
        (window as any).playSoundEffect('success');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/finance-quotes'] });
    },
    onError: () => {
      toast({
        title: "Error Saving Quote",
        description: "There was a problem saving your quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const creditScoreOptions = [
    { value: 'excellent', label: 'Excellent', range: '750+' },
    { value: 'good', label: 'Good', range: '700-749' },
    { value: 'fair', label: 'Fair', range: '650-699' },
    { value: 'poor', label: 'Poor', range: 'Below 650' }
  ];

  const getAPRForCredit = (creditScore: string): number => {
    const rates = {
      excellent: 6.5,
      good: 8.5,
      fair: 12.0,
      poor: 16.5
    };
    return rates[creditScore as keyof typeof rates] || 12.0;
  };

  const getCreditMultiplier = (creditScore: string): number => {
    const multipliers = {
      excellent: 1.5,
      good: 1.3,
      fair: 1.1,
      poor: 0.9
    };
    return multipliers[creditScore as keyof typeof multipliers] || 1.1;
  };

  const updateCalculations = () => {
    const financedAmount = state.purchasePrice - state.downPayment;
    const downPaymentPercent = (state.downPayment / state.purchasePrice) * 100;
    const apr = getAPRForCredit(state.creditScore);
    const monthlyRate = apr / 12 / 100;
    const months = 60;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    } else {
      monthlyPayment = financedAmount / months;
    }

    const maxApproval = financedAmount * getCreditMultiplier(state.creditScore);

    setResults({
      financedAmount,
      monthlyPayment,
      maxApproval,
      apr,
      downPaymentPercent
    });

    // Play sound effect
    if ((window as any).playSoundEffect) {
      (window as any).playSoundEffect('slider');
    }
  };

  useEffect(() => {
    updateCalculations();
  }, [state]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (value: string): string => {
    const number = value.replace(/[^\d]/g, '');
    return parseInt(number) ? parseInt(number).toLocaleString() : '0';
  };

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numValue = parseInt(value) || 0;
    setState(prev => ({ 
      ...prev, 
      purchasePrice: numValue,
      downPayment: Math.min(prev.downPayment, numValue * 0.5) // Max 50%
    }));
  };

  const handleDownPaymentChange = (value: number[]) => {
    setState(prev => ({ ...prev, downPayment: value[0] }));
  };

  const handleCreditScoreChange = (creditScore: CalculatorState['creditScore']) => {
    setState(prev => ({ ...prev, creditScore }));
    if ((window as any).playSoundEffect) {
      (window as any).playSoundEffect('button');
    }
  };

  const handleButtonClick = () => {
    if ((window as any).playSoundEffect) {
      (window as any).playSoundEffect('button');
    }
  };

  const handleSaveQuote = () => {
    const quoteData = {
      purchasePrice: state.purchasePrice.toString(),
      downPayment: state.downPayment.toString(),
      creditScore: state.creditScore,
      financedAmount: results.financedAmount.toString(),
      monthlyPayment: results.monthlyPayment.toString(),
      maxApproval: results.maxApproval.toString()
    };
    
    saveQuoteMutation.mutate(quoteData);
  };

  const progressSteps = [
    { id: 1, title: 'Equipment Details', subtitle: 'Price and specifications confirmed', completed: true },
    { id: 2, title: 'Financing Terms', subtitle: 'Customize your payment structure', completed: false },
    { id: 3, title: 'Application Submission', subtitle: 'Submit for approval', completed: false }
  ];

  const maxDownPayment = state.purchasePrice * 0.5; // 50% max

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-float">
            <Calculator className="text-white w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ClickLease Calculator
          </h1>
        </div>
        <p className="text-lg text-neutral max-w-2xl mx-auto">
          Discover your financing options with our intuitive calculator. Adjust your down payment and see real-time changes to your approval amount.
        </p>
      </header>

      {/* Main Calculator */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column: Calculator Controls */}
        <div className="space-y-6 animate-slide-up">
          {/* Purchase Price Input */}
          <Card className="rounded-3xl shadow-xl border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Tag className="text-primary mr-3 w-5 h-5" />
                Purchase Price
              </h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  type="text"
                  value={formatNumber(state.purchasePrice.toString())}
                  onChange={handlePurchasePriceChange}
                  className="pl-8 pr-4 py-4 text-2xl font-bold text-gray-800 bg-soft rounded-2xl border-2 border-transparent focus:border-primary h-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Down Payment Slider */}
          <Card className="rounded-3xl shadow-xl border-gray-100">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <DollarSign className="text-secondary mr-3 w-5 h-5" />
                  Down Payment
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(state.downPayment)}
                  </div>
                  <div className="text-sm text-neutral">
                    ({results.downPaymentPercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Slider
                  value={[state.downPayment]}
                  onValueChange={handleDownPaymentChange}
                  max={maxDownPayment}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral">
                  <span>$0</span>
                  <span>50% Max</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Score Selector */}
          <Card className="rounded-3xl shadow-xl border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="text-success mr-3 w-5 h-5" />
                Credit Score Range
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {creditScoreOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={state.creditScore === option.value ? "default" : "outline"}
                    onClick={() => handleCreditScoreChange(option.value as CalculatorState['creditScore'])}
                    className={`p-4 h-auto rounded-xl text-left transition-all duration-300 ${
                      state.creditScore === option.value 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-gray-800">{option.label}</div>
                      <div className="text-sm text-neutral">{option.range}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results Display */}
        <div className="space-y-6 animate-slide-up lg:animate-delay-200">
          {/* Financing Breakdown */}
          <Card className="rounded-3xl border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Calculator className="text-primary mr-3 w-5 h-5" />
                Financing Breakdown
              </h3>
              
              {/* Financed Amount */}
              <Card className="mb-6 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Financed Amount</span>
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(results.financedAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Payment */}
              <Card className="mb-6 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600 block">Est. Monthly Payment</span>
                      <span className="text-sm text-neutral">60 months @ {results.apr}% APR</span>
                    </div>
                    <span className="text-2xl font-bold text-secondary">
                      {formatCurrency(results.monthlyPayment)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Max Approval */}
              <Card className="bg-gradient-to-r from-success/10 to-success/20 border-success/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-success font-medium mb-2">Maximum Approval Amount</div>
                    <div className="text-4xl font-bold text-success mb-2">
                      {formatCurrency(results.maxApproval)}
                    </div>
                    <div className="text-sm text-success/80">Based on your credit profile</div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Application Progress */}
          <Card className="rounded-3xl shadow-xl border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <ClipboardCheck className="text-warning mr-3 w-5 h-5" />
                Application Progress
              </h3>
              
              <div className="space-y-4">
                {progressSteps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border ${
                      step.completed 
                        ? 'bg-success/5 border-success/20' 
                        : step.id === 2 
                          ? 'bg-warning/5 border-warning/20'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      step.completed 
                        ? 'bg-success' 
                        : step.id === 2 
                          ? 'bg-warning'
                          : 'bg-gray-300'
                    }`}>
                      {step.completed ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${step.completed || step.id === 2 ? 'text-gray-800' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                      <div className="text-sm text-neutral">{step.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
        <Button
          onClick={handleButtonClick}
          className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-auto"
        >
          <Rocket className="mr-2 w-4 h-4" />
          Continue Application
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveQuote}
          disabled={saveQuoteMutation.isPending}
          className="px-8 py-4 bg-white text-primary font-semibold rounded-2xl shadow-lg border-2 border-primary/20 hover:bg-primary/5 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-auto disabled:opacity-50 disabled:transform-none"
        >
          <Save className="mr-2 w-4 h-4" />
          {saveQuoteMutation.isPending ? 'Saving...' : 'Save Quote'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setState({
              purchasePrice: 50000,
              downPayment: 5000,
              creditScore: 'excellent'
            });
            handleButtonClick();
          }}
          className="px-8 py-4 bg-white text-neutral font-semibold rounded-2xl shadow-lg border-2 border-gray-200 hover:bg-gray-50 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-auto"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
