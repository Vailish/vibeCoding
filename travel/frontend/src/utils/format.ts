// 금액 포맷팅 함수 (소수점 제거, 천 단위 콤마)
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return '0원';
  return `${Math.floor(amount).toLocaleString('ko-KR')}원`;
};

// 숫자 입력값 포맷팅 (천 단위 콤마 추가)
export const formatNumberInput = (value: string): string => {
  // 숫자가 아닌 문자 제거 (콤마도 제거)
  const numericValue = value.replace(/[^0-9]/g, '');
  if (numericValue === '' || numericValue === '0') return numericValue === '' ? '' : '0';
  
  // 앞의 0들 제거 후 천 단위 콤마 추가
  const cleanNumber = parseInt(numericValue, 10);
  return cleanNumber.toLocaleString('ko-KR');
};

// 포맷된 숫자를 실제 숫자로 변환
export const parseFormattedNumber = (value: string): number => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue === '' ? 0 : parseInt(numericValue);
};

// 예산 포맷팅 함수
export const formatBudget = (budget: number): string => {
  return budget > 0 ? formatCurrency(budget) : '예산 미정';
};

// 예산 비교 함수
export const calculateBudgetComparison = (estimated: number, actual: number) => {
  const safeEstimated = Number(estimated) || 0;
  const safeActual = Number(actual) || 0;
  const difference = safeActual - safeEstimated;
  const percentage = safeEstimated > 0 ? (difference / safeEstimated) * 100 : 0;
  
  return {
    difference,
    percentage,
    isOverBudget: difference > 0,
    isUnderBudget: difference < 0,
    isOnBudget: difference === 0
  };
};

// 예산 상태 색상 가져오기
export const getBudgetStatusColor = (estimated: number, actual: number): string => {
  const safeEstimated = Number(estimated) || 0;
  const safeActual = Number(actual) || 0;
  
  if (safeActual === 0 && safeEstimated === 0) return 'text-gray-500';
  if (safeActual === 0) return 'text-blue-500';
  
  const comparison = calculateBudgetComparison(safeEstimated, safeActual);
  
  if (comparison.isOnBudget) return 'text-green-500';
  if (comparison.isUnderBudget) return 'text-green-600';
  if (comparison.percentage <= 10) return 'text-yellow-500';
  return 'text-red-500';
};

// 예산 상태 텍스트 가져오기
export const getBudgetStatusText = (estimated: number, actual: number): string => {
  const safeEstimated = Number(estimated) || 0;
  const safeActual = Number(actual) || 0;
  
  if (safeActual === 0 && safeEstimated === 0) return '예산 미정';
  if (safeActual === 0) return '예정';
  
  const comparison = calculateBudgetComparison(safeEstimated, safeActual);
  
  if (comparison.isOnBudget) return '예산 맞음';
  if (comparison.isUnderBudget) {
    return `${formatCurrency(Math.abs(comparison.difference))} 절약`;
  }
  return `${formatCurrency(comparison.difference)} 초과`;
};

// 일정별 예산 표시 텍스트 (실제 지출이 0인 경우 다르게 표시)
export const getItineraryBudgetText = (estimated: number, actual: number, isCompleted: boolean): string => {
  const safeEstimated = Number(estimated) || 0;
  const safeActual = Number(actual) || 0;
  const estimatedText = safeEstimated > 0 ? `예산: ${formatCurrency(safeEstimated)}` : '';
  
  // 실제 지출이 0인 경우
  if (safeActual === 0) {
    if (isCompleted) {
      // 완료된 일정이지만 지출이 0인 경우 - 무료로 처리
      return estimatedText ? `${estimatedText} | 실제: 무료` : '무료';
    } else {
      // 미완료 일정 - 예산만 표시하거나 예산 미정
      return estimatedText || '예산 미정';
    }
  }
  
  // 실제 지출이 있는 경우 - 완료/미완료 상관없이 동일하게 표시
  const actualText = `실제: ${formatCurrency(safeActual)}`;
  const statusText = getBudgetStatusText(safeEstimated, safeActual);
  
  if (estimatedText) {
    return `${estimatedText} | ${actualText} (${statusText})`;
  } else {
    return actualText;
  }
};