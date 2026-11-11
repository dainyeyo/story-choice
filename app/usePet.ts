"use client";

import { useCallback, useMemo } from "react";
import { localDateKey, parsePet, petGrowthDays, type PetMood, type PetState } from "@/lib/pet";
import { readRaw, useStored, writeRaw } from "@/lib/localStore";
import type { SavedStory } from "@/lib/library";

function addUnique(list: string[], value: string) {
  return list.includes(value) ? list : [...list, value];
}

function addDays(date: string, amount: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + amount);
  return localDateKey(next.getTime());
}

function testDatesBetween(from: string, to: string) {
  if (to <= from) return [];
  const dates: string[] = [];
  let cursor = from;
  while (cursor < to && dates.length < 400) {
    cursor = addDays(cursor, 1);
    dates.push(cursor);
  }
  return dates;
}

export function usePet(user: string, library: SavedStory[]) {
  const key = `story-choice:pet:${user}`;
  const raw = useStored(key);
  const saved = useMemo(() => parsePet(raw), [raw]);
  const storyDates = useMemo(() => library.map((story) => localDateKey(story.createdAt)), [library]);
  const careDates = useMemo(() => [...new Set([...saved.careDates, ...saved.testCareDates, ...storyDates])].sort(), [saved.careDates, saved.testCareDates, storyDates]);
  const storyStars = useMemo(() => library.reduce((total, story) => total + 10 + (story.memo ? 5 : 0), 0), [library]);
  const today = saved.testDate ?? localDateKey();
  const state = useMemo(() => ({
    ...saved,
    careDates,
    growthDays: petGrowthDays(saved, today),
    points: Math.max(0, saved.stars + storyStars - saved.spentStars),
  }), [saved, careDates, storyStars, today]);

  const update = useCallback((change: (current: PetState) => PetState) => {
    writeRaw(key, JSON.stringify(change(parsePet(readRaw(key)))));
  }, [key]);

  const markCare = useCallback((time?: number) => {
    const day = time === undefined ? today : localDateKey(time);
    update((current) => ({ ...current, careDates: addUnique(current.careDates, day) }));
  }, [today, update]);

  const feed = useCallback(() => {
    update((current) => {
      const first = !current.fedDates.includes(today);
      return { ...current, stars: current.stars + (first ? 1 : 0), fedDates: addUnique(current.fedDates, today), careDates: addUnique(current.careDates, today) };
    });
  }, [today, update]);

  const pet = useCallback(() => {
    update((current) => {
      const first = !current.pettedDates.includes(today);
      return { ...current, stars: current.stars + (first ? 1 : 0), pettedDates: addUnique(current.pettedDates, today), careDates: addUnique(current.careDates, today) };
    });
  }, [today, update]);

  const setMood = useCallback((mood: PetMood) => {
    update((current) => ({
      ...current,
      stars: current.stars + (current.moods[today] ? 0 : 1),
      moods: { ...current.moods, [today]: mood },
      careDates: addUnique(current.careDates, today),
    }));
  }, [today, update]);

  const nurture = useCallback((starCost: number, growthDays: number) => {
    if (!Number.isInteger(starCost) || starCost <= 0 || !Number.isInteger(growthDays) || growthDays <= 0) return false;
    const available = Math.max(0, saved.stars + storyStars - saved.spentStars);
    if (available < starCost) return false;
    update((current) => ({ ...current, spentStars: current.spentStars + starCost, growthBoostDays: current.growthBoostDays + growthDays }));
    return true;
  }, [saved.stars, saved.spentStars, storyStars, update]);

  const setTestDate = useCallback((date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    update((current) => {
      const from = current.testDate ?? localDateKey();
      const simulated = testDatesBetween(from, date);
      return { ...current, testDate: date, testCareDates: [...new Set([...current.testCareDates, ...simulated])] };
    });
  }, [update]);

  const advanceTestDate = useCallback((days: number) => setTestDate(addDays(today, days)), [setTestDate, today]);

  const resetTest = useCallback(() => {
    const realToday = localDateKey();
    update((current) => ({
      ...current,
      testDate: undefined,
      testCareDates: [],
      careDates: current.careDates.filter((date) => date <= realToday),
      fedDates: current.fedDates.filter((date) => date <= realToday),
      pettedDates: current.pettedDates.filter((date) => date <= realToday),
      moods: Object.fromEntries(Object.entries(current.moods).filter(([date]) => date <= realToday)),
    }));
  }, [update]);

  const rename = useCallback((name: string) => {
    const next = name.trim().slice(0, 10);
    if (next) update((current) => ({ ...current, name: next }));
  }, [update]);

  return { state, today, markCare, feed, pet, setMood, rename, nurture, setTestDate, advanceTestDate, resetTest };
}
