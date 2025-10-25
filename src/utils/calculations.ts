import type {
  CalculationSummary,
  RollInput,
  SetColumn,
} from "@/types";

export function calculateWeight({
  width,
  substance,
  length,
  rolls,
}: {
  width: number;
  substance: number;
  length: number;
  rolls: number;
}) {
  if (!width || !substance || !length || !rolls) return 0;
  const weightKg = (width / 1000) * length * (substance / 1000) * rolls;
  return weightKg / 1000;
}

export function getSetTotals({
  rolls,
  sets,
  substance,
  length,
}: {
  rolls: RollInput[];
  sets: SetColumn[];
  substance: number;
  length: number;
}) {
  const setWidthSums = sets.map(() => 0);
  const setWeightSums = sets.map(() => 0);
  const summary: CalculationSummary = { required: {}, produced: {} };

  sets.forEach((set, setIndex) => {
    let singleSetWeight = 0;
    rolls.forEach((roll) => {
      const width = Number(roll.width) || 0;
      const qty = Number(roll.quantities[setIndex]) || 0;
      setWidthSums[setIndex] += width * qty;
      if (qty > 0) {
        singleSetWeight += calculateWeight({
          width,
          substance,
          length,
          rolls: qty,
        });
      }
    });
    setWeightSums[setIndex] = singleSetWeight * (set.multiplier || 1);
  });

  rolls.forEach((roll) => {
    const width = Number(roll.width) || 0;
    if (!width) return;
    const requiredTons = Number(roll.requiredTons) || 0;
    let totalRolls = 0;
    sets.forEach((set, setIndex) => {
      totalRolls += (Number(roll.quantities[setIndex]) || 0) * set.multiplier;
    });
    const producedTons = calculateWeight({
      width,
      substance,
      length,
      rolls: totalRolls,
    });

    summary.required[width] = (summary.required[width] || 0) + requiredTons;
    if (!summary.produced[width]) summary.produced[width] = { rolls: 0, tons: 0 };
    summary.produced[width].rolls += totalRolls;
    summary.produced[width].tons += producedTons;
  });

  return {
    setWidthSums,
    setWeightSums,
    summary,
  };
}

