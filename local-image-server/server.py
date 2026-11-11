"""Local FLUX.2 Klein 4B NF4 image server for the Story Choice app."""
from io import BytesIO
import os

import torch
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
from diffusers import Flux2KleinPipeline

MODEL_ID = os.getenv("LOCAL_IMAGE_MODEL", "cukrus/FLUX.2-klein-4B-bnb-nf4")
app = FastAPI(title="Story Choice local image server")
pipe = None


@app.on_event("startup")
def load_model():
    global pipe
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA GPU is required for local image generation")
    pipe = Flux2KleinPipeline.from_pretrained(
        MODEL_ID, torch_dtype=torch.bfloat16, device_map="cuda"
    )
    pipe.vae.enable_tiling()


@app.get("/health")
def health():
    return {"ready": pipe is not None, "model": MODEL_ID}


@app.post("/generate")
async def generate(request: Request):
    form = await request.form()
    prompt = str(form.get("prompt", "")).strip()
    if not prompt:
        raise HTTPException(400, "Prompt is required")
    width = min(512, max(256, int(form.get("width", 512))))
    height = min(512, max(256, int(form.get("height", 512))))
    references = []
    for index in range(4):
        item = form.get(f"input_image_{index}")
        if item is not None and hasattr(item, "read"):
            try:
                references.append(Image.open(BytesIO(await item.read())).convert("RGB"))
            except Exception as exc:
                raise HTTPException(400, "Invalid reference image") from exc
    kwargs = {"prompt": prompt, "width": width, "height": height,
              "num_inference_steps": 4, "guidance_scale": 1.0}
    if references:
        kwargs["image"] = references[0] if len(references) == 1 else references
    try:
        image = pipe(**kwargs).images[0]
        output = BytesIO()
        image.save(output, format="PNG")
        return Response(output.getvalue(), media_type="image/png")
    except torch.cuda.OutOfMemoryError as exc:
        torch.cuda.empty_cache()
        raise HTTPException(503, "Out of GPU memory; close other GPU applications") from exc
