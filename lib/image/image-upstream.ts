type CloudflareBody = { success?: boolean; errors?: Array<{ code?: number; message?: string }>; result?: string | { image?: string; images?: string[] } };

export class ImageUpstreamError extends Error {
  constructor(message: string, public errorCode: string, public status: number,
    public retryable = false, public upstreamCode?: number, public upstreamStatus?: number,
    public rayId?: string, public attempts = 1) { super(message); }
}

// Local inference can take longer than the hosted API and returns the image
// bytes directly rather than Cloudflare's JSON envelope.
export async function fetchLocalImage(url: string, form: FormData, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/generate`, {
      method: "POST", body: form, cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(180_000)]),
    });
  } catch (error) {
    const timeout = error instanceof Error && /Timeout|Abort/.test(error.name);
    throw new ImageUpstreamError(timeout ? "로컬 이미지 생성 시간이 초과됐어요." : "로컬 이미지 서버에 연결하지 못했어요.",
      timeout ? "IMAGE_REQUEST_TIMEOUT" : "IMAGE_NETWORK_ERROR", timeout ? 504 : 503);
  }
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ImageUpstreamError(message || "로컬 이미지 서버가 요청을 처리하지 못했어요.", "LOCAL_IMAGE_FAILED", response.status);
  }
  const mime = response.headers.get("content-type") || "image/png";
  if (!mime.startsWith("image/")) throw new ImageUpstreamError("로컬 이미지 서버의 응답 형식이 올바르지 않아요.", "IMAGE_RESPONSE_INVALID", 502);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new ImageUpstreamError("로컬 이미지 서버가 빈 결과를 반환했어요.", "IMAGE_RESPONSE_INVALID", 502);
  return { bytes, mime, attempts: 1 };
}

export function classifyImageFailure(body: CloudflareBody, status: number, rayId?: string) {
  const code = body.errors?.[0]?.code;
  const message = body.errors?.map((error) => error.message || "").join(" ") || "";
  const failure = (text: string, errorCode: string, httpStatus: number, retryable = false) =>
    new ImageUpstreamError(text, errorCode, httpStatus, retryable, code, status, rayId);
  if (body.errors?.some((error) => error.code === 3030) || /output has been flagged/i.test(message))
    return failure("이미지 생성 서비스의 안전 필터가 이 요청의 결과를 차단했어요. 삽화 설명이나 참고 이미지를 바꾼 뒤 다시 시도해 주세요.", "IMAGE_CONTENT_FLAGGED", 422);
  if (code === 3036 || /daily.*(allocation|limit)|quota|insufficient.*(credit|balance)/i.test(message))
    return failure("이미지 생성 사용량 또는 잔액 한도에 도달했어요. Cloudflare 계정의 사용량과 결제를 확인해 주세요.", "IMAGE_QUOTA_EXCEEDED", 429);
  if (status === 401 || status === 403)
    return failure("이미지 생성 서비스의 인증 또는 접근 권한을 확인해 주세요.", "IMAGE_ACCESS_DENIED", status);
  if (status === 429 || code === 3040)
    return failure("이미지 생성 서비스가 혼잡해요. 잠시 후 다시 시도해 주세요.", "IMAGE_SERVICE_BUSY", 429, true);
  if (status === 408 || code === 3007 || code === 3008)
    return failure("이미지 생성 서비스의 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.", "IMAGE_UPSTREAM_TIMEOUT", 504);
  if ([500, 502, 503, 504].includes(status))
    return failure("이미지 생성 서비스에 일시적인 장애가 발생했어요. 잠시 후 다시 시도해 주세요.", "IMAGE_SERVICE_UNAVAILABLE", 503, true);
  return failure("이미지 생성 서비스가 요청을 처리하지 못했어요. 오류 코드와 요청 번호를 확인해 주세요.", `CLOUDFLARE_${code ?? status}`, status >= 400 && status <= 599 ? status : 502);
}

// Retry explicit transient rejections only. A disconnected/timed-out request may
// already have generated a billable image, so do not automatically replay it.
export async function fetchCloudflareImage(url: string, token: string, form: FormData, signal: AbortSignal) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
        cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(45_000)]),
      });
    } catch (error) {
      const timeout = error instanceof Error && /Timeout|Abort/.test(error.name);
      throw new ImageUpstreamError(timeout ? "이미지 생성 응답 시간이 초과됐어요. 다시 시도해 주세요." : "이미지 생성 서비스와 연결하지 못했어요. 다시 시도해 주세요.",
        timeout ? "IMAGE_REQUEST_TIMEOUT" : "IMAGE_NETWORK_ERROR", timeout ? 504 : 502, false, undefined, undefined, undefined, attempt);
    }
    const contentType = response.headers.get("content-type") || "";
    const rayId = response.headers.get("cf-ray") || undefined;
    let body: CloudflareBody = {};
    if (contentType.includes("application/json") || !response.ok) {
      try { body = await response.json() as CloudflareBody; } catch { /* Non-JSON upstream errors are classified by status. */ }
    }
    if (!response.ok || body.success === false || body.errors?.length) {
      const failure = classifyImageFailure(body, response.status, rayId);
      failure.attempts = attempt;
      const retryAfter = response.headers.get("retry-after");
      const seconds = retryAfter === null ? NaN : Number(retryAfter);
      const requestedDelay = retryAfter === null ? 0 : Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
      // Do not retry earlier than Retry-After, or hold an interactive request for minutes.
      if (!failure.retryable || attempt === 2 || requestedDelay > 5000) throw failure;
      const delay = Math.max(700 + Math.random() * 300, Number.isFinite(requestedDelay) ? requestedDelay : 0);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
      signal.throwIfAborted();
      continue;
    }
    let bytes: Buffer;
    let mime = contentType.split(";")[0];
    if (contentType.includes("application/json")) {
      const image = typeof body.result === "string" ? body.result : body.result?.image || body.result?.images?.[0];
      if (!image) throw new ImageUpstreamError("이미지 생성 응답에 이미지가 없어요. 다시 시도해 주세요.", "IMAGE_RESPONSE_INVALID", 502, false, undefined, response.status, rayId, attempt);
      const dataUrl = image.match(/^data:(image\/(?:png|jpeg|webp));base64,([\s\S]*)$/);
      mime = dataUrl?.[1] || "image/png";
      bytes = Buffer.from(dataUrl?.[2] || image, "base64");
    } else if (["image/png", "image/jpeg", "image/webp"].includes(mime)) {
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      throw new ImageUpstreamError("이미지 생성 서비스가 잘못된 형식으로 응답했어요.", "IMAGE_RESPONSE_INVALID", 502, false, undefined, response.status, rayId, attempt);
    }
    if (!bytes.length) throw new ImageUpstreamError("이미지 생성 결과가 비어 있어요.", "IMAGE_RESPONSE_INVALID", 502, false, undefined, response.status, rayId, attempt);
    return { bytes, mime, attempts: attempt, rayId };
  }
  throw new Error("Unreachable image retry state");
}
