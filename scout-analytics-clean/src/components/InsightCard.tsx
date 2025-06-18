import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Lightbulb,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';

interface InsightCardProps {
  title: string;
  data: {
    value: number | string;
    change?: number;
    unit?: string;
    previousValue?: number;
  };
  type: 'metric' | 'trend' | 'comparison' | 'status';
  enableRetailBotValidation?: boolean;
  threshold?: {
    warning?: number;
    critical?: number;
  };
  context?: string;
  className?: string;
}

interface ValidationResult {
  status: 'valid' | 'warning' | 'error' | 'info';
  confidence: number;
  message: string;
  suggestions?: string[];
  alternative_views?: string[];
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  data,
  type,
  enableRetailBotValidation = false,
  threshold,
  context = 'general',
  className = ''
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Mock RetailBot validation (in production, this would call the actual RetailBot API)
  const validateData = async () => {
    if (!enableRetailBotValidation) return;

    setIsValidating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const value = typeof data.value === 'number' ? data.value : parseFloat(data.value.toString().replace(/[^\d.-]/g, ''));
    const change = data.change || 0;

    // Business logic validation based on context and thresholds
    let validationResult: ValidationResult;

    if (context === 'revenue' || title.toLowerCase().includes('revenue')) {
      if (change < -10) {
        validationResult = {
          status: 'error',
          confidence: 0.92,
          message: 'Significant revenue decline detected. This requires immediate attention.',
          suggestions: [
            'Review recent marketing campaigns for effectiveness',
            'Check for seasonal patterns or external factors',
            'Analyze top-performing products and regions',
            'Consider promotional strategies to boost sales'
          ],
          alternative_views: [
            'Compare by product category',
            'Break down by customer segment',
            'Analyze by sales channel'
          ]
        };
      } else if (change < -5) {
        validationResult = {
          status: 'warning',
          confidence: 0.85,
          message: 'Revenue growth is below expectations. Monitor closely.',
          suggestions: [
            'Review customer acquisition metrics',
            'Analyze competitor activities',
            'Check inventory availability'
          ]
        };
      } else if (change > 20) {
        validationResult = {
          status: 'info',
          confidence: 0.88,
          message: 'Exceptional revenue growth detected. Validate data quality.',
          suggestions: [
            'Verify data sources for accuracy',
            'Check for one-time events or bulk orders',
            'Analyze sustainability of growth drivers'
          ]
        };
      } else {
        validationResult = {
          status: 'valid',
          confidence: 0.94,
          message: 'Revenue performance is within normal ranges.',
          suggestions: []
        };
      }
    } else if (context === 'transactions' || title.toLowerCase().includes('transaction')) {
      if (change < -15) {
        validationResult = {
          status: 'error',
          confidence: 0.89,
          message: 'Transaction volume dropping significantly. Check system issues.',
          suggestions: [
            'Verify POS system functionality',
            'Check for network connectivity issues',
            'Review recent system updates or changes'
          ]
        };
      } else {
        validationResult = {
          status: 'valid',
          confidence: 0.91,
          message: 'Transaction volume is performing normally.',
          suggestions: []
        };
      }
    } else if (context === 'customers' || title.toLowerCase().includes('customer')) {
      if (change < -8) {
        validationResult = {
          status: 'warning',
          confidence: 0.87,
          message: 'Customer acquisition declining. Review marketing effectiveness.',
          suggestions: [
            'Analyze customer churn patterns',
            'Review marketing campaign performance',
            'Check customer satisfaction scores'
          ]
        };
      } else {
        validationResult = {
          status: 'valid',
          confidence: 0.93,
          message: 'Customer metrics are within expected ranges.',
          suggestions: []
        };
      }
    } else {
      // Generic validation
      validationResult = {
        status: 'valid',
        confidence: 0.90,
        message: 'Metric appears to be performing within normal parameters.',
        suggestions: []
      };
    }

    setValidation(validationResult);
    setIsValidating(false);
  };

  // Trigger validation when data changes
  useEffect(() => {
    if (enableRetailBotValidation) {
      validateData();
    }
  }, [data.value, data.change, enableRetailBotValidation]);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    
    if (context === 'revenue' || title.toLowerCase().includes('revenue')) {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-PH').format(value);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {data.unit && (
            <p className="text-sm text-slate-500 mt-1">{data.unit}</p>
          )}
        </div>
        
        {enableRetailBotValidation && (
          <div className="flex items-center space-x-2">
            {isValidating ? (
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            ) : validation ? (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-800 transition-colors"
              >
                {getStatusIcon(validation.status)}
                <span>AI Validated</span>
                <Eye className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-900 mb-2">
          {formatValue(data.value)}
        </div>
        
        {data.change !== undefined && (
          <div className="flex items-center space-x-2">
            {data.change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              data.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500">vs previous period</span>
          </div>
        )}
      </div>

      {/* AI Validation Details */}
      {enableRetailBotValidation && validation && showDetails && (
        <div className={`mt-4 p-4 rounded-lg border ${getStatusColor(validation.status)}`}>
          <div className="flex items-start space-x-2 mb-3">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">RetailBot Analysis</h4>
              <p className="text-xs opacity-75">Confidence: {(validation.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
          
          <p className="text-sm mb-3">{validation.message}</p>
          
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <Lightbulb className="h-3 w-3" />
                <span className="text-xs font-medium">Suggestions:</span>
              </div>
              <ul className="text-xs space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-xs opacity-50">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.alternative_views && validation.alternative_views.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">Alternative Views:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {validation.alternative_views.map((view, index) => (
                  <button
                    key={index}
                    className="text-xs px-2 py-1 rounded border border-current opacity-75 hover:opacity-100 transition-opacity"
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threshold Indicators */}
      {threshold && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-slate-500 mb-2">Performance Thresholds:</div>
          <div className="space-y-1">
            {threshold.critical && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600">Critical:</span>
                <span className="text-red-600">{formatValue(threshold.critical)}</span>
              </div>
            )}
            {threshold.warning && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-600">Warning:</span>
                <span className="text-amber-600">{formatValue(threshold.warning)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightCard;