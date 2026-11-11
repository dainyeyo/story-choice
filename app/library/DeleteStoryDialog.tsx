"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import { btnSecondary, inputCls } from "../components/ui";

export default function DeleteStoryDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const matches = title.length > 0 && confirmation === title;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-story-title"
      aria-describedby="delete-story-description"
      onCancel={onCancel}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-line bg-surface p-6 text-ink shadow-2xl [color-scheme:light] backdrop:bg-black/55 backdrop:backdrop-blur-sm sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <Icon name="book" size={23} />
        </span>
        <button type="button" onClick={onCancel} aria-label="삭제 창 닫기" className="calm flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-sunk">
          <Icon name="close" size={20} />
        </button>
      </div>
      <h2 id="delete-story-title" className="story text-2xl">이 동화책을 삭제할까요?</h2>
      <p id="delete-story-description" className="mt-2 text-[15px] leading-6 text-ink-2">
        서재에서 삭제한 동화책은 되돌릴 수 없어요.
        <br />아래 제목을 똑같이 입력해 주세요.
      </p>
      <p className="story mt-5 rounded-xl bg-sunk px-4 py-3 text-lg leading-7 [overflow-wrap:anywhere]">{title}</p>
      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (matches) onConfirm();
        }}
      >
        <label htmlFor="delete-story-confirmation" className="text-sm font-medium">동화책 제목</label>
        <input
          autoFocus
          id="delete-story-confirmation"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault();
          }}
          aria-describedby="delete-story-hint"
          placeholder="동화책 제목을 입력해 주세요"
          className={`${inputCls} mt-2`}
        />
        <p id="delete-story-hint" aria-live="polite" className={`mt-2 text-sm ${confirmation && !matches ? "text-danger" : "text-ink-2"}`}>
          {matches ? "제목이 일치해요. 삭제할 수 있어요." : confirmation ? "제목이 일치하지 않아요. 띄어쓰기까지 확인해 주세요." : "제목이 일치하면 삭제 확인 버튼이 활성화돼요."}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className={btnSecondary}>취소</button>
          <button type="submit" disabled={!matches} className="calm inline-flex h-12 items-center justify-center rounded-xl bg-danger px-4 text-base font-medium text-white enabled:hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-40">
            삭제 확인
          </button>
        </div>
      </form>
    </dialog>
  );
}
