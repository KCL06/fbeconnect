import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface PasswordCriteria {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  hasMinLength: boolean;
}

export function validatePassword(password: string): PasswordCriteria {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasMinLength: password.length >= 8,
  };
}

export function isPasswordValid(criteria: PasswordCriteria): boolean {
  return Object.values(criteria).every(Boolean);
}

interface Props {
  password: string;
  onValidChange?: (isValid: boolean) => void;
}

export default function PasswordStrengthIndicator({ password, onValidChange }: Props) {
  const [criteria, setCriteria] = useState<PasswordCriteria>({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  useEffect(() => {
    const newCriteria = validatePassword(password);
    setCriteria(newCriteria);
    if (onValidChange) {
      onValidChange(isPasswordValid(newCriteria));
    }
  }, [password, onValidChange]);

  const strengthScore = Object.values(criteria).filter(Boolean).length;
  
  // Visual indicators
  let strengthLabel = "Too Weak";
  let barColor = "bg-red-500";
  
  if (strengthScore === 0) {
    strengthLabel = "None";
    barColor = "bg-gray-600";
  } else if (strengthScore <= 2) {
    strengthLabel = "Weak";
    barColor = "bg-red-400";
  } else if (strengthScore <= 4) {
    strengthLabel = "Fair";
    barColor = "bg-yellow-400";
  } else {
    strengthLabel = "Strong";
    barColor = "bg-emerald-500";
  }

  const requirements = [
    { label: "At least 8 characters", met: criteria.hasMinLength },
    { label: "Uppercase letter (A-Z)", met: criteria.hasUppercase },
    { label: "Lowercase letter (a-z)", met: criteria.hasLowercase },
    { label: "Number (0-9)", met: criteria.hasNumber },
    { label: "Special character (!@#...)", met: criteria.hasSpecialChar },
  ];

  if (!password && strengthScore === 0) {
    return null; // Don't show anything if empty
  }

  return (
    <div className="mt-3 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 transition-all">
      {/* Strength Bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white/80">Password Strength:</span>
        <span className={`text-xs font-bold ${strengthScore === 5 ? 'text-emerald-400' : 'text-white/60'}`}>
          {strengthLabel}
        </span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`flex-1 h-full transition-all duration-300 ${i <= strengthScore ? barColor : 'bg-transparent'}`} 
          />
        ))}
      </div>

      {/* Criteria List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-2">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
              {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
            </div>
            <span className={`text-xs transition-colors ${req.met ? 'text-emerald-300' : 'text-white/50'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
