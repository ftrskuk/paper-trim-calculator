export type MillDeckle = {
  min: number;
  max: number;
};

export type RequiredRoll = {
  id: string;
  width: number;
  tons: number;
};

export type RollInput = {
  id: string;
  width: number | "";
  requiredTons: number | "";
  quantities: Array<number | "">;
};

export type SetColumn = {
  id: string;
  multiplier: number;
};

export type CalculatorSnapshot = {
  mill: string;
  substance: number;
  length: number;
  rolls: RollInput[];
  sets: SetColumn[];
};

export type AISuggestion = {
  sets: Array<{
    multiplier: number;
    combination: Record<string, number>;
  }>;
};

export type CalculationSummary = {
  required: Record<number, number>;
  produced: Record<number, { rolls: number; tons: number }>;
};

