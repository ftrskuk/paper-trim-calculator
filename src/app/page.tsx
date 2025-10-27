"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MILL_DECKLES } from "@/constants/mills";
import { PlusIcon, SparklesIcon, TrashIcon } from "@/components/icons";
import { requestOptimization } from "@/services/openai";
import { calculateWeight, getSetTotals } from "@/utils/calculations";
import { exportToExcel, exportToPdf } from "@/utils/export";
import type { HistoryItem, HistorySummary, RollInput, SetColumn } from "@/types";
import {
  deleteCalculation,
  fetchCalculation,
  listHistory,
  saveCalculation,
  updateCalculation,
} from "@/services/history";
import { useSupabaseAuthContext } from "@/components/supabase-provider";
import toast, { Toaster } from "react-hot-toast";

const DEFAULT_ROLL_COUNT = 3;
const DEFAULT_SET_COUNT = 3;

function createRoll(id: string, setCount: number): RollInput {
  return {
    id,
    width: "",
    requiredTons: "",
    quantities: Array(setCount).fill("") as Array<"" | number>,
  };
}

function createSet(id: string): SetColumn {
  return {
    id,
    multiplier: 1,
  };
}

export default function HomePage() {
  const { user, isLoading, signInWithGoogle, signOut } =
    useSupabaseAuthContext();
  const [mill, setMill] = useState<string>(Object.keys(MILL_DECKLES)[0]);
  const [substance, setSubstance] = useState<number>(80);
  const [length, setLength] = useState<number>(9000);
  const [rolls, setRolls] = useState<RollInput[]>(() =>
    Array.from({ length: DEFAULT_ROLL_COUNT }, (_, index) =>
      createRoll(`roll-${index}`, DEFAULT_SET_COUNT)
    )
  );
  const [sets, setSets] = useState<SetColumn[]>(() =>
    Array.from({ length: DEFAULT_SET_COUNT }, (_, index) =>
      createSet(`set-${index}`)
    )
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const deckle = MILL_DECKLES[mill];

  const isAuthenticated = Boolean(user);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }
    setIsHistoryLoading(true);
    try {
      const items = await listHistory();
      setHistory(items);
    } catch (error) {
      console.error("Failed to load history", error);
      toast.error("기록을 불러오지 못했습니다.");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const totals = useMemo(
    () =>
      getSetTotals({
        rolls,
        sets,
        substance,
        length,
      }),
    [rolls, sets, substance, length]
  );

  const summaryWidths = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.keys(totals.summary.required),
          ...Object.keys(totals.summary.produced),
        ]).values()
      )
        .map(Number)
        .sort((a, b) => a - b),
    [totals.summary]
  );

  const setTotalRolls = (rollIndex: number, setIndex: number, value: string) => {
    setRolls((prev) =>
      prev.map((roll, rIndex) => {
        if (roll.id !== prev[rollIndex].id || rIndex !== rollIndex) return roll;
        const nextQuantities = [...roll.quantities];
        nextQuantities[setIndex] = value === "" ? "" : Number(value);
        return {
          ...roll,
          quantities: nextQuantities,
        };
      })
    );
  };

  const handleRollBasicChange = (
    rollIndex: number,
    field: "width" | "requiredTons",
    value: string
  ) => {
    setRolls((prev) =>
      prev.map((roll, rIndex) => {
        if (rIndex !== rollIndex) return roll;
        return {
          ...roll,
          [field]: value === "" ? "" : Number(value),
        };
      })
    );
  };

  const addRoll = () => {
    setRolls((prev) => {
      const nextId = `roll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return [...prev, createRoll(nextId, sets.length)];
    });
  };

  const removeRoll = (rollIndex: number) => {
    setRolls((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, index) => index !== rollIndex);
    });
  };

  const addSet = () => {
    setSets((prev) => {
      const nextId = `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const next = [...prev, createSet(nextId)];
      setRolls((existing) =>
        existing.map((roll) => ({
          ...roll,
          quantities: [...roll.quantities, ""],
        }))
      );
      return next;
    });
  };

  const removeSet = (indexToRemove: number) => {
    setSets((prev) => {
      if (prev.length <= 1) return prev;
      const nextSets = prev.filter((_, index) => index !== indexToRemove);
      setRolls((existing) =>
        existing.map((roll) => ({
          ...roll,
          quantities: roll.quantities.filter((_, i) => i !== indexToRemove),
        }))
      );
      return nextSets;
    });
  };

  const updateMultiplier = (index: number, value: string) => {
    setSets((prev) =>
      prev.map((set, setIndex) =>
        setIndex === index
          ? {
              ...set,
              multiplier: Math.max(1, Number(value) || 1),
            }
          : set
      )
    );
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const requiredRolls = rolls
        .map((roll, index) => ({
          id: roll.id ?? `roll-${index}`,
          width: Number(roll.width) || 0,
          tons: Number(roll.requiredTons) || 0,
        }))
        .filter((roll) => roll.width > 0 && roll.tons > 0);

      if (!requiredRolls.length) {
        alert("지폭과 필요 톤 수를 입력해주세요.");
        return;
      }

      const suggestion = await requestOptimization({
        mill,
        deckle,
        requiredRolls,
      });

      if (!suggestion?.sets?.length) {
        alert("AI 제안이 비어 있습니다. 다시 시도해주세요.");
        return;
      }

      const maxSets = Math.max(sets.length, suggestion.sets.length);

      setSets((prevSets) => {
        const nextSets: SetColumn[] = Array.from({ length: maxSets }, (_, idx) => {
          return (
            suggestion.sets[idx]?.multiplier !== undefined
              ? {
                  id: prevSets[idx]?.id ?? `set-${idx}`,
                  multiplier: suggestion.sets[idx]?.multiplier ?? 1,
                }
              : prevSets[idx] ?? createSet(`set-${idx}`)
          );
        });

        setRolls((prevRolls) => {
          const updatedRolls = prevRolls.map((roll) => ({
            ...roll,
            quantities: Array(maxSets).fill(""),
          }));

          suggestion.sets.forEach((setSuggestion, setIndex) => {
            Object.entries(setSuggestion.combination).forEach(([rollId, qty]) => {
              const rollIndex = updatedRolls.findIndex((roll) => roll.id === rollId);
              if (rollIndex >= 0) {
                updatedRolls[rollIndex].quantities[setIndex] = qty;
              }
            });
          });

          return updatedRolls;
        });

        return nextSets;
      });
    } catch (error) {
      console.error(error);
      alert("AI 최적화 요청 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExport = (type: "excel" | "pdf") => {
    const payload = {
      mill,
      substance,
      length,
      rolls,
      sets,
      setWidthSums: totals.setWidthSums,
      setWeightSums: totals.setWeightSums,
    };

    if (type === "excel") {
      exportToExcel(payload);
    } else {
      exportToPdf(payload);
    }
  };

  const buildSnapshot = (): HistoryItem["data"] => ({
    mill,
    substance,
    length,
    rolls,
    sets,
  });

  const applySnapshot = (snapshot: HistoryItem["data"]) => {
    setMill(snapshot.mill);
    setSubstance(snapshot.substance);
    setLength(snapshot.length);
    setSets(snapshot.sets);
    setRolls(snapshot.rolls);
  };

  const handleSaveHistory = async () => {
    if (!isAuthenticated) {
      toast.error("Google 로그인 후 이용해주세요.");
      return;
    }

    const name = window.prompt("저장할 이름을 입력하세요", "새 계산");
    if (!name) return;

    setIsSaving(true);
    try {
      const { item } = await saveCalculation({
        name,
        snapshot: buildSnapshot(),
      });
      setHistory((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
      setSelectedHistoryId(item.id);
      toast.success("저장 완료");
    } catch (error) {
      console.error(error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateHistory = async (id: string) => {
    try {
      const { item } = await updateCalculation({
        id,
        snapshot: buildSnapshot(),
      });
      setHistory((prev) =>
        prev.map((historyItem) =>
          historyItem.id === item.id ? { ...historyItem, ...item } : historyItem,
        ),
      );
      toast.success("업데이트 완료");
    } catch (error) {
      console.error(error);
      toast.error("업데이트에 실패했습니다.");
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteCalculation(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
      toast.success("삭제 완료");
    } catch (error) {
      console.error(error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleLoadHistory = async (id: string) => {
    try {
      const { item } = await fetchCalculation(id);
      applySnapshot(item.data);
      setSelectedHistoryId(id);
    } catch (error) {
      console.error(error);
      toast.error("기록을 불러오지 못했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Paper Trim Calculator
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              초지기 트림 사이즈 계산기 (MVP)
          </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Deckle 최소: {deckle.min}mm</span>
            <span className="hidden md:inline">·</span>
            <span>Deckle 최대: {deckle.max}mm</span>
            <span className="hidden md:inline">·</span>
            {isLoading ? (
              <span className="text-slate-400">로그인 상태 확인 중...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">
                  {user?.email ?? user?.id}
                </span>
                <button
                  onClick={signOut}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Google 로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">내 계산 기록</h2>
              <p className="text-sm text-slate-500">
                저장한 계산을 불러오거나 이름을 변경하고 삭제할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadHistory}
                disabled={!isAuthenticated || isHistoryLoading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleSaveHistory}
                disabled={!isAuthenticated || isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving ? "저장 중..." : "현재 계산 저장"}
              </button>
              {selectedHistoryId && (
                <button
                  type="button"
                  onClick={() => handleUpdateHistory(selectedHistoryId)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  현재 내용으로 덮어쓰기
                </button>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Google 로그인 후 계산 기록을 저장하거나 불러올 수 있습니다.
            </div>
          ) : isHistoryLoading ? (
            <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
              기록을 불러오는 중입니다...
            </div>
          ) : history.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              저장된 계산이 없습니다. 현재 계산을 저장해보세요.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {history.map((item) => {
                const isActive = item.id === selectedHistoryId;
                return (
                  <li
                    key={item.id}
                    className={`flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between ${
                      isActive ? "border-blue-500 shadow" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        저장: {new Date(item.created_at).toLocaleString()} · 수정: {new Date(item.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadHistory(item.id)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const newName = prompt("새 이름을 입력하세요", item.name);
                          if (!newName) return;
                          try {
                            const { item: updated } = await updateCalculation({
                              id: item.id,
                              name: newName,
                            });
                            setHistory((prev) =>
                              prev.map((h) =>
                                h.id === updated.id ? { ...h, ...updated } : h,
                              ),
                            );
                            toast.success("이름을 변경했습니다.");
                          } catch (error) {
                            console.error(error);
                            toast.error("이름 변경에 실패했습니다.");
                          }
                        }}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        이름 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">1. 생산 기본 조건</h2>
          <p className="mt-1 text-sm text-slate-500">
            제지사 선택에 따라 적용 가능한 Deckle 범위가 자동으로 표시됩니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              제지사
              <select
                value={mill}
                onChange={(event) => setMill(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {Object.keys(MILL_DECKLES).map((millName) => (
                  <option key={millName} value={millName}>
                    {millName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              평량 (g/m²)
              <input
                type="number"
                min={0}
                value={substance}
                onChange={(event) => setSubstance(Number(event.target.value) || 0)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              롤 길이 (m)
              <input
                type="number"
                min={0}
                value={length}
                onChange={(event) => setLength(Number(event.target.value) || 0)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Deckle 범위: {deckle.min}mm ~ {deckle.max}mm
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. 세트 조합 구성</h2>
              <p className="text-sm text-slate-500">
                필요에 따라 지폭 행과 세트 열을 추가 또는 삭제할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <SparklesIcon className="h-4 w-4" />
                {isOptimizing ? "AI 계산 중..." : "AI로 채우기"}
              </button>
              <button
                type="button"
                onClick={addSet}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <PlusIcon className="h-4 w-4" />
                세트 추가
              </button>
              <button
                type="button"
                onClick={addRoll}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <PlusIcon className="h-4 w-4" />
                지폭 추가
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-center text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-100 text-xs uppercase text-slate-500">
                  <th className="w-32 px-3 py-2 text-left">지폭 (mm)</th>
                  <th className="w-32 px-3 py-2 text-left">필요수량 (톤)</th>
                  <th className="w-44 px-3 py-2 text-left">생산량 (롤 / 톤)</th>
                  <th className="w-12 px-3 py-2" aria-label="delete roll" />
                  {sets.map((set, index) => (
                    <th key={set.id} className="px-3 py-2">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">
                          Set {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            value={set.multiplier}
                            onChange={(event) => updateMultiplier(index, event.target.value)}
                            className="w-16 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSet(index)}
                            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                            aria-label={`세트 ${index + 1} 삭제`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
        </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rolls.map((roll, rollIndex) => {
                  const totalRolls = sets.reduce((acc, set, setIndex) => {
                    const quantity = Number(roll.quantities[setIndex]) || 0;
                    return acc + quantity * set.multiplier;
                  }, 0);

                  const producedTons = calculateWeight({
                    width: Number(roll.width) || 0,
                    substance,
                    length,
                    rolls: totalRolls,
                  });

                  return (
                    <tr key={roll.id} className="bg-white">
                      <td className="p-2 text-left">
                        <input
                          type="number"
                          min={0}
                          value={roll.width}
                          onChange={(event) =>
                            handleRollBasicChange(rollIndex, "width", event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                      <td className="p-2 text-left">
                        <input
                          type="number"
                          min={0}
                          step={0.001}
                          value={roll.requiredTons}
                          onChange={(event) =>
                            handleRollBasicChange(
                              rollIndex,
                              "requiredTons",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                      <td className="p-2 text-left text-sm text-slate-500">
                        {totalRolls} 롤 / {producedTons.toFixed(3)} 톤
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => removeRoll(rollIndex)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label={`지폭 ${rollIndex + 1} 삭제`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                      {sets.map((set, setIndex) => (
                        <td key={`${roll.id}-${set.id}`} className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={roll.quantities[setIndex] ?? ""}
                            onChange={(event) => setTotalRolls(rollIndex, setIndex, event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 text-sm font-semibold text-slate-700">
                  <td className="p-2 text-right" colSpan={4}>
                    지폭합 (mm)
                  </td>
                  {totals.setWidthSums.map((sum, index) => {
                    const inRange = sum >= deckle.min && sum <= deckle.max;
                    const zero = sum === 0;
                    const badgeClass = zero
                      ? ""
                      : inRange
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700";
                    return (
                      <td key={`width-${index}`} className="p-2">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${badgeClass}`}>
                          {sum}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-slate-100 text-sm font-semibold text-slate-700">
                  <td className="p-2 text-right" colSpan={4}>
                    총 무게 (톤)
                  </td>
                  {totals.setWeightSums.map((weight, index) => (
                    <td key={`weight-${index}`} className="p-2">
                      {weight.toFixed(3)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. 발주 요약</h2>
              <p className="text-sm text-slate-500">
                계산 결과를 Excel 또는 PDF 파일로 내보낼 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleExport("excel")}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Excel로 내보내기
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")} 
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                PDF로 내보내기
              </button>
            </div>
          </div>

          {summaryWidths.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              지폭과 세트 조합을 입력하면 요약 결과가 표시됩니다.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summaryWidths.map((width) => {
                const required = totals.summary.required[width] ?? 0;
                const produced = totals.summary.produced[width] ?? {
                  rolls: 0,
                  tons: 0,
                };
                const difference = produced.tons - required;

                return (
                  <article key={width} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <header className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {width} mm
                      </h3>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        필요 {required.toFixed(3)}t
                      </span>
                    </header>
                    <dl className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <dt>생산 롤 수</dt>
                        <dd className="font-semibold text-slate-800">
                          {produced.rolls}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>생산 톤수</dt>
                        <dd className="font-semibold text-slate-800">
                          {produced.tons.toFixed(3)}t
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>차이</dt>
                        <dd
                          className={`font-semibold ${
                            difference > 0.0001
                              ? "text-emerald-600"
                              : difference < -0.0001
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          {difference > 0 ? "+" : ""}
                          {difference.toFixed(3)}t
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
        </div>
          )}
        </section>
      </main>
    </div>
  );
}
