"use client";

import { useCallback, useMemo } from "react";
import { localDateKey, parsePet, type PetMood, type PetState } from "@/lib/pet";
import { readRaw, useStored, writeRaw } from "@/lib/localStore";
import type { SavedStory } from "@/lib/library";

function addUnique(list: string[], value: string) {
  return list.includes(value) ? list : [...list, value];
}

export function usePet(user: string, library: SavedStory[]) {
  const key = `story-choice:pet:${user}`;
  const raw = useStored(key);
  const saved = useMemo(() => parsePet(raw), [raw]);
  const storyDates = useMemo(() => library.map((story) => localDateKey(story.createdAt)), [library]);
  const careDates = useMemo(() => [...new Set([...saved.careDates, ...storyDates])].sort(), [saved.careDates, storyDates]);
  const state = useMemo(() => ({ ...saved, careDates }), [saved, careDates]);

  const update = useCallback((change: (current: PetState) => PetState) => {
    writeRaw(key, JSON.stringify(change(parsePet(readRaw(key)))));
  }, [key]);

  const markCare = useCallback((time = Date.now()) => {
    const day = localDateKey(time);
    update((current) => ({ ...current, careDates: addUnique(current.careDates, day) }));
  }, [update]);

  const feed = useCallback(() => {
    const day = localDateKey();
    update((current) => ({ ...current, fedDates: addUnique(current.fedDates, day), careDates: addUnique(current.careDates, day) }));
  }, [update]);

  const pet = useCallback(() => {
    const day = localDateKey();
    update((current) => ({ ...current, pettedDates: addUnique(current.pettedDates, day), careDates: addUnique(current.careDates, day) }));
  }, [update]);

  const setMood = useCallback((mood: PetMood) => {
    const day = localDateKey();
    update((current) => ({ ...current, moods: { ...current.moods, [day]: mood }, careDates: addUnique(current.careDates, day) }));
  }, [update]);

  const rename = useCallback((name: string) => {
    const next = name.trim().slice(0, 10);
    if (next) update((current) => ({ ...current, name: next }));
  }, [update]);

  return { state, markCare, feed, pet, setMood, rename };
}
